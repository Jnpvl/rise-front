import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultationsService } from '../../../services/consultations.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientsService } from '../../../services/patients.service';
import { ConsultationFormComponent } from '../../../components/consultation-form/consultation-form.component';
import { StaffService } from '../../../services/staff.service';
import { UploadService } from '../../../services/upload.service';
import { getConsultationTemplate } from '../../../constants/consultation-templates';
import {
  PODOLOGY_CONDITIONS,
  PODOLOGY_FOOT_TYPES,
  PodologySpecialtyData,
  parsePodologySpecialtyData,
} from '../../../constants/podology-form';

@Component({
  selector: 'app-consultation-info',
  imports: [FormsModule, CommonModule, ConsultationFormComponent],
  templateUrl: './consultation-info.component.html',
})
export class ConsultationInfoComponent implements OnInit {
  consultationId: string | null = null;
  consultationData: any = {};
  patientId: string | null = null;
  isEditing = false;
  isLoading = false;
  patientsList: any[] = [];
  staffMap: { [id: string]: any } = {};
  isPrescriptionLoading = false;
  podology: PodologySpecialtyData = parsePodologySpecialtyData(null);

  readonly podologyConditions = PODOLOGY_CONDITIONS;
  readonly podologyFootTypes = PODOLOGY_FOOT_TYPES;

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params) => {
      this.consultationId = params.get('id');
    });
  }

  private consultationSvc = inject(ConsultationsService);
  private patientSvc = inject(PatientsService);
  private router = inject(Router);
  private staffSvc = inject(StaffService);
  private uploadService = inject(UploadService);

  ngOnInit() {
    this.loadAll();
    this.loadStaff();
  }

  get isPodology(): boolean {
    return this.consultationData?.templateKey === 'podology';
  }

  get templateLabel(): string {
    return getConsultationTemplate(this.consultationData?.templateKey).title;
  }

  get activeConditions(): Array<{
    label: string;
    left: boolean;
    right: boolean;
  }> {
    return this.podologyConditions
      .map((item) => {
        const side = this.podology.conditions[item.key];
        return {
          label: item.label,
          left: Boolean(side?.left),
          right: Boolean(side?.right),
        };
      })
      .filter((item) => item.left || item.right);
  }

  footTypeLabel(value: string | null | undefined): string {
    if (!value) return '—';
    return (
      this.podologyFootTypes.find((item) => item.key === value)?.label || value
    );
  }

  async loadAll() {
    this.isLoading = true;
    await Promise.all([this.loadConsultation(), this.loadPatientsList()]);
    this.isLoading = false;
  }

  async loadConsultation() {
    try {
      const res = await this.consultationSvc.getConsultationById(
        this.consultationId!
      );
      this.patientId = res.patientId;
      this.consultationData = {
        ...res,
        patientName: `${res.patient?.firstName || ''} ${
          res.patient?.lastName || ''
        }`,
      };
      this.podology = parsePodologySpecialtyData(res.specialtyData);
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al obtener consulta',
        confirmButtonColor: '#DC2626',
      });
    }
  }

  async loadPatientsList() {
    try {
      this.patientsList = await this.patientSvc.getActivePatients();
    } catch {
      this.patientsList = [];
    }
  }

  async loadStaff() {
    try {
      const staffList = await this.staffSvc.getAllStaff();
      this.staffMap = {};
      for (const staff of staffList) {
        this.staffMap[staff.id] = staff;
      }
    } catch {
      this.staffMap = {};
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  async onFormSubmitted(updatedConsultationData: Partial<any>): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;
    const { __pendingFileDeletes, ...payload } = updatedConsultationData || {};
    try {
      await this.consultationSvc.updateConsultation(
        this.consultationId!,
        payload
      );
      await this.uploadService.deletePendingFiles(__pendingFileDeletes as any);
      await this.loadConsultation();
      Swal.fire({
        icon: 'success',
        title: 'Consulta actualizada',
        text: payload['nextAppointment']
          ? 'La consulta se actualizó y la próxima cita quedó sincronizada en el calendario.'
          : 'La información de la consulta ha sido actualizada correctamente',
        confirmButtonColor: '#E540AE',
      });
      this.isEditing = false;
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          error?.error?.message ||
          'Ocurrió un error al actualizar la consulta',
        confirmButtonColor: '#DC2626',
      });
    } finally {
      this.isLoading = false;
    }
  }

  onFormCancelled(): void {
    this.isEditing = false;
  }

  expediente() {
    this.router.navigate(['/admin/pacientes', this.patientId]);
  }

  getStaffName(id: string): string {
    const staff = this.staffMap[id];
    return staff ? staff.name : id;
  }

  private async readErrorMessage(
    err: unknown,
    fallback: string
  ): Promise<string> {
    const body = (err as { error?: unknown })?.error;

    if (body instanceof Blob) {
      try {
        const parsed = JSON.parse(await body.text()) as { message?: string };
        if (parsed.message) {
          return parsed.message;
        }
      } catch {
        // ignore
      }
    }

    if (
      body &&
      typeof body === 'object' &&
      'message' in body &&
      typeof (body as { message?: unknown }).message === 'string'
    ) {
      return (body as { message: string }).message;
    }

    return fallback;
  }

  async getPrescription() {
    if (this.isPodology) {
      return this.getPodologyReport();
    }

    this.isPrescriptionLoading = true;
    try {
      const res = await this.consultationSvc.getPrescription(
        this.consultationId!
      );

      if (res && res.size > 0) {
        const pdfUrl = window.URL.createObjectURL(res as Blob);
        window.open(pdfUrl, '_blank');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'La receta está vacía o no se pudo generar.',
          confirmButtonColor: '#DC2626',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: await this.readErrorMessage(err, 'Error al obtener receta.'),
        confirmButtonColor: '#DC2626',
      });
    } finally {
      this.isPrescriptionLoading = false;
    }
  }

  async getPodologyReport() {
    if (!this.isPodology) return;

    this.isPrescriptionLoading = true;
    try {
      const res = await this.consultationSvc.getPodologyReport(
        this.consultationId!
      );

      if (res && res.size > 0) {
        const pdfUrl = window.URL.createObjectURL(res as Blob);
        window.open(pdfUrl, '_blank');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El reporte está vacío o no se pudo generar.',
          confirmButtonColor: '#DC2626',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: await this.readErrorMessage(
          err,
          'Error al generar el seguimiento de podología.'
        ),
        confirmButtonColor: '#DC2626',
      });
    } finally {
      this.isPrescriptionLoading = false;
    }
  }
}
