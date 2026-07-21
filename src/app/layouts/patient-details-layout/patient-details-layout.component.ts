import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet, RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Patient } from '../../interfaces/patients.interface';
import { PatientsService } from '../../services/patients.service'
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-details-layout',
  imports: [CommonModule, RouterOutlet, RouterModule, MatIconModule],
  templateUrl: './patient-details-layout.component.html',
})
export class PatientDetailsLayoutComponent implements OnInit {
  patientData: Partial<Patient> = {};
  patientId: string = '';
  patientName: string = '';
  isLoading: boolean = false;
  activeSection: 'informacion' | 'consultas' | 'adjuntos' | 'historial' = 'informacion';

  private patientsService = inject(PatientsService);

  constructor(
    private route: ActivatedRoute,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = params['id'];
      this.loadPatientInfo();
    });
    this.route.firstChild?.url.subscribe(segments => {
      const section = segments[0]?.path;
      if (section === 'consultas' || section === 'adjuntos' || section === 'historial' || section === 'informacion') {
        this.activeSection = section as any;
      }
    });
    this.router.events.subscribe(() => {
      const url = this.router.url;
      if (url.includes('/consultas')) this.activeSection = 'consultas';
      else if (url.includes('/adjuntos')) this.activeSection = 'adjuntos';
      else if (url.includes('/historial')) this.activeSection = 'historial';
      else this.activeSection = 'informacion';
    });
  }

  async loadPatientInfo() {
    this.isLoading = true;
    try {
      this.patientData = await this.patientsService.getPatientById(this.patientId);
      this.patientName = `${this.patientData.firstName || ''} ${this.patientData.lastName || ''}`.trim();

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

  navigateToSection(section: 'informacion' | 'consultas' | 'adjuntos' | 'historial'): void {
    this.router.navigate([`/admin/pacientes/${this.patientId}/${section}`]);
  }

  goBackToList(): void {
    this.router.navigate(['/admin/pacientes']);
  }

  consultation(){
    this.router.navigate(['/admin/consultation'], { queryParams: { patientId: this.patientId } });
  }

  labRegistration() {
    this.router.navigate(['/admin/laboratorios'], {
      queryParams: { patientId: this.patientId },
    });
  }

}
