import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientsService } from '../../services/patients.service';
import { LabResultsService } from '../../services/lab-results.service';
import { AuthService } from '../../services/auth.service';
import { Patient } from '../../interfaces/patients.interface';
import {
  LabCaptureDraft,
  LabPanel,
  createEmptyLabDraft,
  createEmptyLabRow,
  createEmptyPanel,
  groupRowsBySection,
} from '../../constants/lab-capture';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lab-capture',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './lab-capture.component.html',
})
export class LabCaptureComponent implements OnInit {
  private patientsService = inject(PatientsService);
  private labResultsService = inject(LabResultsService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  patientSuggestions: Patient[] = [];
  isSearchingPatients = false;
  showPatientDropdown = false;
  isGeneratingPdf = false;
  isSaving = false;
  isLoadingPatientFromQuery = false;
  patientSearch = '';
  selectedPatientId = '';
  selectedPatient: Patient | null = null;

  draft: LabCaptureDraft = createEmptyLabDraft();

  readonly groupRowsBySection = groupRowsBySection;

  private patientSearchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const patientId = params.get('patientId')?.trim();
      if (patientId && patientId !== this.selectedPatientId) {
        void this.preselectPatientById(patientId);
      }
    });
  }

  private async preselectPatientById(patientId: string): Promise<void> {
    this.isLoadingPatientFromQuery = true;
    try {
      const patient = await this.patientsService.getPatientById(patientId);
      this.selectedPatient = patient;
      this.selectedPatientId = patient.id;
      this.patientSearch = `${patient.firstName} ${patient.lastName}`;
      this.showPatientDropdown = false;
      this.patientSuggestions = [];
    } catch {
      await Swal.fire({
        icon: 'warning',
        title: 'Paciente no encontrado',
        text: 'No se pudo precargar el paciente del expediente.',
        confirmButtonColor: '#E540AE',
      });
    } finally {
      this.isLoadingPatientFromQuery = false;
    }
  }

  get signingDoctorName(): string {
    return this.authService.getUser()?.name?.trim() || 'Médico RISE';
  }

  get signingDoctorCedula(): string {
    return this.authService.getUser()?.cedula?.trim() || '';
  }

  get signingDoctorSignature(): string {
    return this.authService.getUser()?.signatureDataUrl?.trim() || '';
  }

  get patientAge(): string {
    if (!this.selectedPatient?.birthDate) return '—';
    const birth = new Date(this.selectedPatient.birthDate);
    if (isNaN(birth.getTime())) return '—';
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} años`;
  }

  get patientGenderLabel(): string {
    const g = (this.selectedPatient?.gender || '').toLowerCase();
    if (g.startsWith('f')) return 'Femenino';
    if (g.startsWith('m')) return 'Masculino';
    return this.selectedPatient?.gender || '—';
  }

  get formattedStudyDate(): string {
    if (!this.draft.studyDate) return '—';
    const d = new Date(`${this.draft.studyDate}T12:00:00`);
    if (isNaN(d.getTime())) return this.draft.studyDate;
    return d.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  async onPatientSearchInput(value: string): Promise<void> {
    this.patientSearch = value;
    this.showPatientDropdown = true;

    if (this.patientSearchTimer) {
      clearTimeout(this.patientSearchTimer);
    }

    const q = value.trim();
    if (q.length < 2) {
      this.patientSuggestions = [];
      this.isSearchingPatients = false;
      return;
    }

    this.isSearchingPatients = true;
    this.patientSearchTimer = setTimeout(() => {
      void this.searchPatients(q);
    }, 280);
  }

  onPatientSearchFocus(): void {
    if (this.patientSearch.trim().length >= 2) {
      this.showPatientDropdown = true;
    }
  }

  closePatientDropdownSoon(): void {
    setTimeout(() => {
      this.showPatientDropdown = false;
    }, 150);
  }

  private async searchPatients(query: string): Promise<void> {
    try {
      const res = await this.patientsService.getPatients(1, 12, 'true', query);
      this.patientSuggestions = res.patients || [];
    } catch {
      this.patientSuggestions = [];
    } finally {
      this.isSearchingPatients = false;
    }
  }

  async selectPatient(patient: Patient): Promise<void> {
    this.showPatientDropdown = false;
    this.patientSuggestions = [];
    this.patientSearch = `${patient.firstName} ${patient.lastName}`;
    this.selectedPatientId = patient.id;

    try {
      // El listado/búsqueda puede venir incompleto; cargamos ficha completa
      // para edad, sexo y PDF.
      this.selectedPatient = await this.patientsService.getPatientById(patient.id);
    } catch {
      this.selectedPatient = patient;
    }
  }

  clearPatient(): void {
    this.selectedPatient = null;
    this.selectedPatientId = '';
    this.patientSearch = '';
    this.patientSuggestions = [];
    this.showPatientDropdown = false;
  }

  addPanel(): void {
    this.draft.panels.push(createEmptyPanel(`Panel ${this.draft.panels.length + 1}`));
  }

  removePanel(index: number): void {
    if (this.draft.panels.length <= 1) return;
    this.draft.panels.splice(index, 1);
  }

  addRow(panel: LabPanel): void {
    panel.rows.push(createEmptyLabRow());
  }

  removeRow(panel: LabPanel, rowIndex: number): void {
    if (panel.rows.length <= 1) return;
    panel.rows.splice(rowIndex, 1);
  }

  panelHasStatus(panel: LabPanel): boolean {
    return panel.rows.some((row) => Boolean(row.status?.trim()));
  }

  private validateDraftForSave(): string | null {
    if (!this.selectedPatient) {
      return 'Selecciona un paciente para guardar en su expediente.';
    }
    if (!this.draft.studyDate) {
      return 'Indica la fecha del estudio.';
    }

    for (const panel of this.draft.panels) {
      const title = panel.title?.trim() || 'Panel';
      const filled = panel.rows.filter(
        (row) => row.name?.trim() || row.value?.trim()
      );
      if (filled.length === 0) {
        return `En "${title}" agrega al menos un análisis con resultado.`;
      }
      const incomplete = filled.find(
        (row) => !row.name?.trim() || !row.value?.trim()
      );
      if (incomplete) {
        return `En "${title}" completa el nombre del análisis y el resultado.`;
      }
    }

    return null;
  }

  private async apiErrorMessage(err: any, fallback: string): Promise<string> {
    if (err?.error instanceof Blob) {
      try {
        const text = await err.error.text();
        const json = JSON.parse(text);
        if (json?.message) return String(json.message);
      } catch {
        /* ignore parse errors */
      }
    }
    return err?.error?.message || err?.message || fallback;
  }

  async saveToChart(): Promise<void> {
    const validationError = this.validateDraftForSave();
    if (validationError) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: validationError,
        confirmButtonColor: '#E540AE',
      });
      return;
    }

    const patientId = this.selectedPatient!.id;
    this.isSaving = true;
    try {
      // Cada guardado crea un nuevo registro (un paciente puede tener varios labs).
      await this.labResultsService.create(patientId, this.draft);

      await Swal.fire({
        icon: 'success',
        title: 'Guardado exitoso',
        text: 'Los resultados se guardaron en el expediente del paciente.',
        confirmButtonColor: '#20D0DF',
      });

      this.draft = createEmptyLabDraft();
      this.clearPatient();

      await this.router.navigate(['/admin/pacientes', patientId, 'adjuntos']);
    } catch (err: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: await this.apiErrorMessage(err, 'No se pudieron guardar los resultados.'),
        confirmButtonColor: '#E540AE',
      });
    } finally {
      this.isSaving = false;
    }
  }

  async generatePdf(): Promise<void> {
    if (!this.draft.studyDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Fecha del estudio',
        text: 'Indica la fecha del estudio para generar el PDF.',
        confirmButtonColor: '#E540AE',
      });
      return;
    }

    const filledPanels = this.draft.panels.filter((panel) =>
      panel.rows.some((row) => row.name?.trim() || row.value?.trim())
    );
    if (filledPanels.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin resultados',
        text: 'Agrega al menos un análisis con resultado antes de generar el PDF.',
        confirmButtonColor: '#E540AE',
      });
      return;
    }

    this.isGeneratingPdf = true;
    try {
      const blob = await this.labResultsService.previewPdf({
        patientId: this.selectedPatient?.id,
        patientName: this.selectedPatient
          ? `${this.selectedPatient.firstName} ${this.selectedPatient.lastName}`
          : undefined,
        patientBirthDate: this.selectedPatient?.birthDate,
        patientGender: this.selectedPatient?.gender,
        studyDate: this.draft.studyDate,
        generalNotes: this.draft.generalNotes,
        panels: this.draft.panels,
      });

      if (!blob || blob.size === 0) {
        throw new Error('El servidor no devolvió un PDF válido.');
      }

      const pdfUrl = window.URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');
    } catch (err: any) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo generar el PDF',
        text: await this.apiErrorMessage(
          err,
          'Revisa que haya análisis con resultado e intenta de nuevo.'
        ),
        confirmButtonColor: '#E540AE',
      });
    } finally {
      this.isGeneratingPdf = false;
    }
  }
}
