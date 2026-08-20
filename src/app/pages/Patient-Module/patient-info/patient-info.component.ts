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
  isPrinting = false;


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

  async printRecord() {
    if (!this.patientId || this.isPrinting) return;
    this.isPrinting = true;
    try {
      const blob = await this.patientsService.getPatientRecordPdf(this.patientId);
      if (!blob || blob.size === 0) {
        throw new Error('PDF vacío');
      }
      const pdfUrl = window.URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');
    } catch (err: any) {
      let message = 'No se pudo generar el expediente.';
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
        confirmButtonColor: '#DC2626',
      });
    } finally {
      this.isPrinting = false;
    }
  }

  getAge(birthDate: string | undefined | null) {
    if (!birthDate) return null;
    const birth = new Date(
      birthDate.includes('T') ? birthDate : `${birthDate}T12:00:00`
    );
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
  
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
  
    return age;
  }
  
} 