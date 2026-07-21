import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ConsultationsService } from '../../../services/consultations.service';
import { StaffService } from '../../../services/staff.service';
import { getConsultationTemplate } from '../../../constants/consultation-templates';

@Component({
  selector: 'app-patient-consultations',
  imports: [CommonModule],
  templateUrl: './patient-consultations.component.html',
})
export class PatientConsultationsComponent implements OnInit {
  patientId: string = '';
  consultations: any[] = [];
  total: number = 0;
  page: number = 1;
  limit: number = 10;
  Math = Math;
  staffMap: { [id: string]: string } = {};

  private consultationService = inject(ConsultationsService);
  private staffService = inject(StaffService);

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.parent!.params.subscribe(async (params) => {
      this.patientId = params['id'];
      await this.loadStaff();
      this.loadConsultations();
    });
  }

  templateLabel(templateKey: string | null | undefined): string {
    return getConsultationTemplate(templateKey).title;
  }

  summaryFor(consultation: any): string {
    if (consultation.templateKey === 'podology') {
      return consultation.generalInstructions || consultation.diagnosis || 'Seguimiento podológico';
    }
    return consultation.diagnosis || '—';
  }

  treatmentFor(consultation: any): string {
    if (consultation.templateKey === 'podology') {
      return consultation.generalInstructions || '—';
    }
    return consultation.generalInstructions || 'Pendiente';
  }

  async loadConsultations() {
    try {
      const response = await this.consultationService.getConsultations(
        this.page,
        this.limit,
        this.patientId
      );

      this.consultations = response.consultations;
      this.total = response.total;

    } catch (error) {
      console.error('Error loading consult data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las consultas',
        confirmButtonColor: '#DC2626',
      });
    }
  }

  private async loadStaff() {
    try {
      const staffList = await this.staffService.getAllStaff();
      this.staffMap = Object.fromEntries(staffList.map((s: any) => [s.id, s.name]));
    } catch {
      this.staffMap = {};
    }
  }

  changePage(next: boolean) {
    if (next) {
      if (this.page < Math.ceil(this.total / this.limit)) {
        this.page++;
        this.loadConsultations();
      }
    } else {
      if (this.page > 1) {
        this.page--;
        this.loadConsultations();
      }
    }
  }

  viewConsultationDetails(consultationId: string) {
    this.router.navigate(['/admin/consultation-info', consultationId]);
  }

} 