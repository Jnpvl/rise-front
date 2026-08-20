import { Injectable } from '@angular/core';
import { ApiclientService } from './apiclient.service';
import { environment } from '../../environments/environment';
import { Patient, Patients } from '../interfaces/patients.interface';

@Injectable({
  providedIn: 'root'
})
export class PatientsService {

  constructor(
    private apiClient: ApiclientService
  ) { }

  async getPatients(
    page: number = 1,
    limit: number = 10,
    isActive: 'true' | 'false' | 'all' = 'all',
    search: string = '',
    createdById: string = ''
  ): Promise<Patients> {
    const params: Record<string, string | number> = {
      page,
      limit,
    };

    if (isActive !== 'all') params['isActive'] = isActive;
    if (search.trim()) params['search'] = search.trim();
    if (createdById.trim()) params['createdById'] = createdById.trim();

    return this.apiClient.get('patients', environment.apiUrl, { params });
  }
  
  async createPatient(data: Partial<Patient>): Promise<any> {
    return this.apiClient.post('patients', data, environment.apiUrl);
  }
  
  async getPatientById(id: string): Promise<Patient> {
    return this.apiClient.get(`patients/${id}`, environment.apiUrl);
  }

  async getPatientRecordPdf(id: string): Promise<Blob> {
    return this.apiClient.getBlob(`patients/${id}/pdf`, environment.apiUrl);
  }
  
  async updatePatient(id:string,data: Partial<Patient>): Promise<any> {
    return this.apiClient.patch(`patients/${id}`, data, environment.apiUrl);
  }

  getActivePatients() {
    return this.apiClient.get<any[]>('generalInformation/actived-patients', environment.apiUrl);
  }
}
