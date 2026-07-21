import { Injectable } from '@angular/core';
import { ApiclientService } from './apiclient.service';
import { environment } from '../../environments/environment';

export interface ClinicSettings {
  id?: string;
  horario: string;
  telefono: string;
  whatsapp: string;
  ubicacion: string;
  facebookUrl: string;
}

export type ClinicSettingsUpdate = Pick<
  ClinicSettings,
  'horario' | 'telefono' | 'whatsapp' | 'ubicacion' | 'facebookUrl'
>;

@Injectable({
  providedIn: 'root',
})
export class ClinicSettingsService {
  constructor(private readonly apiClient: ApiclientService) {}

  get(): Promise<ClinicSettings> {
    return this.apiClient.get<ClinicSettings>(
      'clinic-settings',
      environment.apiUrl
    );
  }

  update(data: ClinicSettingsUpdate): Promise<ClinicSettings> {
    return this.apiClient.put<ClinicSettings>(
      'clinic-settings',
      data,
      environment.apiUrl
    );
  }
}
