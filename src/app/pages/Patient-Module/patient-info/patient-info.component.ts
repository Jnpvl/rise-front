import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { Patient } from '../../../interfaces/patients.interface';
import { PatientsService } from '../../../services/patients.service';
import { PatientFormComponent } from '../../../components/patient-form/patient-form.component';

@Component({
  selector: 'app-patient-info',
  imports: [CommonModule, PatientFormComponent],
  templateUrl: './patient-info.component.html',
})
export class PatientInfoComponent implements OnInit {
  patientId: string = '';
  patientData: Partial<Patient> = {};
  isEditing = false;
  isLoading = false;


  private patientsService = inject(PatientsService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.parent!.params.subscribe(params => {
      this.patientId = params['id'];
      this.loadPatientData();
    });
  }
  

  async loadPatientData() {
    this.isLoading = true;
    try {
      this.patientData = await this.patientsService.getPatientById(this.patientId);
    } catch (error) {
      console.error('Error loading patient data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la información del paciente.',
        confirmButtonColor: '#DC2626',
      });
    } finally {
      this.isLoading = false;
    }
  }
  

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  async onFormSubmitted(updatedPatientData: Partial<Patient>): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      // En producción, aquí llamarías al servicio para actualizar
      await this.patientsService.updatePatient(this.patientId, updatedPatientData);
      
      // Simular actualización
      this.patientData = { ...this.patientData, ...updatedPatientData };
      
      Swal.fire({
        icon: 'success',
        title: 'Paciente actualizado',
        text: 'La información del paciente ha sido actualizada correctamente',
        confirmButtonColor: '#E540AE',
      });
      
      this.isEditing = false;
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.error?.message || 'Ocurrió un error al actualizar el paciente',
        confirmButtonColor: '#DC2626',
      });
    } finally {
      this.isLoading = false;
    }
  }

  onFormCancelled(): void {
    this.isEditing = false;
  }

  onGoBack(): void {
    this.router.navigate(['/admin/pacientes']);
  }

  getAge(birthDate: string) {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
  
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
  
    return age;
  }
  
} 