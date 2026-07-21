import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { Patient } from '../../../interfaces/patients.interface';
import { PatientsService } from '../../../services/patients.service';
import { PatientFormComponent } from '../../../components/patient-form/patient-form.component';

@Component({
  selector: 'app-patient-create',
  standalone: true,
  imports: [CommonModule, PatientFormComponent],
  templateUrl: './patient-create.component.html',
})
export class PatientCreateComponent {
  isLoading = false;

  constructor(
    private patientsService: PatientsService,
    private router: Router
  ) {}

  async onFormSubmitted(patientData: Partial<Patient>): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const response = await this.patientsService.createPatient(patientData);

      Swal.fire({
        icon: 'success',
        title: 'Paciente creado',
        text: 'El paciente ha sido registrado correctamente',
        confirmButtonColor: '#E540AE',
      }).then(() => {
        const patientId = response.patient.id;
        this.router.navigate(['/admin/pacientes', patientId]);
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.error?.message || 'Ocurrió un error al crear el paciente',
        confirmButtonColor: '#DC2626',
      });
    } finally {
      this.isLoading = false;
    }
  }

  onFormCancelled(): void {
    this.router.navigate(['/admin/pacientes']);
  }

  onGoBack(): void {
    this.router.navigate(['/admin/pacientes']);
  }
}
