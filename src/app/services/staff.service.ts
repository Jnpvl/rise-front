import { Injectable } from '@angular/core';
import { ApiclientService } from './apiclient.service';
import { environment } from '../../environments/environment';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'auxiliar';
  cedula?: string;
  signatureDataUrl?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  constructor(private apiClient: ApiclientService) {}

  getAllStaff(): Promise<StaffMember[]> {
    return this.apiClient.get<StaffMember[]>(`staff`, environment.apiUrl);
  }

  createStaff(data: {
    name: string;
    email: string;
    password: string;
    role: string;
    cedula?: string;
    signatureDataUrl?: string;
  }): Promise<any> {
    return this.apiClient.post(`staff/register`, data, environment.apiUrl);
  }

  updateStaff(id: string, data: Partial<{
    name: string;
    email: string;
    password: string;
    role: string;
    cedula: string;
    signatureDataUrl: string;
    isActive: boolean;
  }>): Promise<any> {
    return this.apiClient.put(`staff/${id}`, data, environment.apiUrl);
  }

  deactivateStaff(id: string): Promise<any> {
    return this.apiClient.delete(`staff/${id}`, environment.apiUrl);
  }
}
