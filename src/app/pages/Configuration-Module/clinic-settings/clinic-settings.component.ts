import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  ClinicSettings,
  ClinicSettingsService,
} from '../../../services/clinic-settings.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clinic-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './clinic-settings.component.html',
})
export class ClinicSettingsComponent implements OnInit {
  private readonly clinicSettingsService = inject(ClinicSettingsService);

  isLoading = false;
  isSaving = false;

  form: ClinicSettings = {
    horario: '',
    telefono: '',
    whatsapp: '',
    ubicacion: '',
    facebookUrl: '',
  };

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.isLoading = true;
    try {
      const settings: ClinicSettings = await this.clinicSettingsService.get();
      this.form = this.toForm(settings);
    } catch {
      Swal.fire('Error', 'No se pudo cargar la configuración', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async save(): Promise<void> {
    this.isSaving = true;
    try {
      const payload = {
        ...this.form,
        facebookUrl: this.normalizeExternalUrl(this.form.facebookUrl),
      };
      const saved: ClinicSettings = await this.clinicSettingsService.update(
        payload
      );
      this.form = this.toForm(saved);
      Swal.fire({
        icon: 'success',
        title: 'Guardado',
        text: 'La información pública se actualizó correctamente',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire('Error', 'No se pudo guardar la configuración', 'error');
    } finally {
      this.isSaving = false;
    }
  }

  private toForm(settings: ClinicSettings): ClinicSettings {
    return {
      horario: settings.horario ?? '',
      telefono: settings.telefono ?? '',
      whatsapp: settings.whatsapp ?? '',
      ubicacion: settings.ubicacion ?? '',
      facebookUrl: this.normalizeExternalUrl(settings.facebookUrl ?? ''),
    };
  }

  private normalizeExternalUrl(url: string): string {
    const value = url.trim();
    if (!value) return '';

    const withoutProtocol = value.replace(/^https?:\/\//i, '');
    return `https://${withoutProtocol}`;
  }
}
