import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ConsultationsService } from '../../../services/consultations.service';
import {
  LabResultRecord,
  LabResultsService,
} from '../../../services/lab-results.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-attachments',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './patient-attachments.component.html',
})
export class PatientAttachmentsComponent implements OnInit {
  patientId = '';
  isLoading = false;
  openingLabId: string | null = null;

  attachments: Array<{
    fileName: string;
    fileUrl: string;
    consultationId: string;
    consultationDate: string;
    consultationType: string;
  }> = [];

  labResults: LabResultRecord[] = [];

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private consultationsSvc = inject(ConsultationsService);
  private labResultsSvc = inject(LabResultsService);

  get hasContent(): boolean {
    return this.labResults.length > 0 || this.attachments.length > 0;
  }

  ngOnInit(): void {
    this.route.parent!.params.subscribe(async (params) => {
      this.patientId = params['id'];
      if (this.patientId) {
        await this.loadAttachments();
      }
    });
  }

  async loadAttachments() {
    this.isLoading = true;
    try {
      const [filesRes, labsRes] = await Promise.all([
        this.consultationsSvc.getPatientAttachments(this.patientId).catch(() => ({
          attachments: [],
        })),
        this.labResultsSvc.listByPatient(this.patientId, 1, 100).catch(() => ({
          labResults: [] as LabResultRecord[],
        })),
      ]);

      this.attachments = filesRes.attachments || [];
      this.labResults = labsRes.labResults || [];
    } catch {
      this.attachments = [];
      this.labResults = [];
    } finally {
      this.isLoading = false;
    }
  }

  formatDate(value: string): string {
    if (!value) return '—';
    const hasTime = value.includes('T');
    const d = new Date(hasTime ? value : `${value}T12:00:00`);
    if (isNaN(d.getTime())) return value;
    if (hasTime) {
      return d.toLocaleString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return d.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  panelSummary(lab: LabResultRecord): string {
    const titles = (lab.panels || [])
      .map((p) => p.title?.trim())
      .filter(Boolean);
    if (titles.length === 0) return 'Resultados de laboratorio';
    if (titles.length === 1) return titles[0];
    return `${titles[0]} (+${titles.length - 1})`;
  }

  openConsultation(consultationId: string) {
    this.router.navigate(['/admin/consultation-info', consultationId]);
  }

  async openLabPdf(lab: LabResultRecord) {
    this.openingLabId = lab.id;
    try {
      const blob = await this.labResultsSvc.getPdf(lab.id);
      if (!blob || blob.size === 0) {
        throw new Error('PDF vacío');
      }
      const pdfUrl = window.URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');
    } catch (err: any) {
      let message = 'No se pudo abrir el PDF del laboratorio.';
      if (err?.error instanceof Blob) {
        try {
          const text = await err.error.text();
          const json = JSON.parse(text);
          if (json?.message) message = String(json.message);
        } catch {
          /* ignore */
        }
      } else if (err?.error?.message || err?.message) {
        message = err?.error?.message || err.message;
      }
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#E540AE',
      });
    } finally {
      this.openingLabId = null;
    }
  }
}
