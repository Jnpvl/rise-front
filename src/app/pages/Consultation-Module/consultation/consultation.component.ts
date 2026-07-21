// src/app/pages/Consultation-Module/consultation/consultation.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConsultationFormComponent } from '../../../components/consultation-form/consultation-form.component';
import { AuthService } from '../../../services/auth.service';
import { PatientsService } from '../../../services/patients.service';
import { ConsultationsService } from '../../../services/consultations.service';
import { StaffService } from '../../../services/staff.service';
import { UploadService } from '../../../services/upload.service';
import {
  CONSULTATION_TEMPLATES,
  ConsultationTemplateKey,
} from '../../../constants/consultation-templates';
import Swal from 'sweetalert2';
import { DestroyRef } from '@angular/core';

@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.component.html',
  standalone: true,
  imports: [CommonModule, ConsultationFormComponent],
})
export class ConsultationComponent implements OnInit {
  patientsList: any[] = [];
  consultationData: Record<string, unknown> = {};
  mode: 'create' | 'edit' = 'create';
  getStaffNameFn = (id: string) => id;

  readonly templates = CONSULTATION_TEMPLATES;
  selectedTemplateKey: ConsultationTemplateKey | null = null;
  showTemplatePicker = true;
  isBootstrapping = true;

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private patientSvc = inject(PatientsService);
  private consultationSvc = inject(ConsultationsService);
  private staffService = inject(StaffService);
  private router = inject(Router);
  private uploadService = inject(UploadService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        void this.bootstrap(params);
      });
  }

  private async bootstrap(params: Record<string, string>) {
    this.isBootstrapping = true;
    const patientId = params['patientId'] || null;
    const consultationId = params['consultationId'] || null;
    const doctorId = params['doctorId'] || null;

    try {
      await this.loadPatientsList();

      if (consultationId) {
        this.mode = 'edit';
        this.showTemplatePicker = false;
        await this.loadConsultationForEdit(consultationId);
      } else {
        this.mode = 'create';
        this.showTemplatePicker = true;
        this.selectedTemplateKey = null;
        const user = this.authService.getUser();
        this.consultationData = {
          doctorId: doctorId || (user ? user.id : ''),
          patientId,
        };
        this.getStaffNameFn = (id: string) => {
          if (user && user.id === id) return user.name;
          return id;
        };
        if (doctorId) {
          try {
            const staffList = await this.staffService.getAllStaff();
            const staffMap = Object.fromEntries(
              staffList.map((s: any) => [s.id, s.name])
            );
            this.getStaffNameFn = (id: string) => staffMap[id] || id;
          } catch {
            // keep default
          }
        }
      }
    } finally {
      this.isBootstrapping = false;
    }
  }

  selectTemplate(key: ConsultationTemplateKey) {
    this.selectedTemplateKey = key;
    this.consultationData = {
      ...this.consultationData,
      templateKey: key,
    };
    this.showTemplatePicker = false;
  }

  changeTemplate() {
    if (this.mode !== 'create') return;
    this.showTemplatePicker = true;
    this.selectedTemplateKey = null;
  }

  private async loadConsultationForEdit(consultationId: string) {
    try {
      const [consultation, staffList] = await Promise.all([
        this.consultationSvc.getConsultationById(consultationId),
        this.staffService.getAllStaff(),
      ]);
      this.consultationData = consultation;
      this.selectedTemplateKey =
        consultation.templateKey === 'podology' ? 'podology' : 'general';
      const staffMap = Object.fromEntries(
        staffList.map((s: any) => [s.id, s.name])
      );
      this.getStaffNameFn = (id: string) => staffMap[id] || id;
    } catch {
      this.getStaffNameFn = (id: string) => id;
    }
  }

  private async loadPatientsList() {
    try {
      this.patientsList = await this.patientSvc.getActivePatients();
    } catch {
      this.patientsList = [];
    }
  }

  async onFormSubmitted(formData: any) {
    const { __pendingFileDeletes, ...payload } = formData || {};
    try {
      const response = await this.consultationSvc.createConsultation({
        ...payload,
        templateKey:
          this.selectedTemplateKey || payload.templateKey || 'general',
      });
      await this.uploadService.deletePendingFiles(__pendingFileDeletes);
      const id = response.consultation.id;

      Swal.fire({
        icon: 'success',
        title: 'Consulta creada',
        text: response?.appointment
          ? 'La consulta se registró y la próxima cita quedó agendada en el calendario.'
          : 'La consulta ha sido registrada correctamente',
        confirmButtonColor: '#E540AE',
      }).then(() => {
        this.router.navigate(['/admin/consultation-info', id]);
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.error?.message || 'Ocurrió un error al guardar la consulta',
        confirmButtonColor: '#DC2626',
      });
    }
  }

  onFormCancelled() {
    this.router.navigate(['/admin/dashboard']);
  }
  onGoBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
