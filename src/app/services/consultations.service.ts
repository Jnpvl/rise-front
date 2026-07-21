import { Injectable } from '@angular/core';
import { ApiclientService } from './apiclient.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConsultationsService {

  constructor(
    private apiClient: ApiclientService
  ) { }

  async getConsultations(
    page: number = 1,
    limit: number = 10,
    patientId: string ,
  ): Promise<any> {
    const params: Record<string, string | number> = {
      page,
      limit,
      patientId
    };
  
  
    return this.apiClient.get(`consultations/consultations-patient/${patientId}`, environment.apiUrl, { params });
  }

  async createConsultation(data: Partial<any>): Promise<any>{
    return this.apiClient.post('consultations/create-consultation',data, environment.apiUrl);
  }

  async getConsultationById(consultationId: string): Promise<any> {
    return this.apiClient.get(`consultations/consultation/${consultationId}`, environment.apiUrl);
  }

  async updateConsultation(consultationId: string, data: Partial<any>): Promise<any> {
    return this.apiClient.patch(`consultations/edit-consultation/${consultationId}`, data, environment.apiUrl);
  }

  async getPrescription(consultationId: string){
    return this.apiClient.getBlob(`consultations/prescription/${consultationId}`, environment.apiUrl);
  }

  async getPodologyReport(consultationId: string) {
    return this.apiClient.getBlob(
      `consultations/podology-report/${consultationId}`,
      environment.apiUrl
    );
  }

  async getPatientAttachments(patientId: string): Promise<{
    total: number;
    attachments: Array<{
      fileName: string;
      fileUrl: string;
      consultationId: string;
      consultationDate: string;
      consultationType: string;
    }>;
  }> {
    return this.apiClient.get(
      `consultations/attachments-patient/${patientId}`,
      environment.apiUrl
    );
  }
  

}

