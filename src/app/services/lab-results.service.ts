import { Injectable } from '@angular/core';
import { ApiclientService } from './apiclient.service';
import { environment } from '../../environments/environment';
import { LabCaptureDraft, LabPanel } from '../constants/lab-capture';

export interface LabResultRecord {
  id: string;
  patientId: string;
  createdById: string;
  studyDate: string;
  generalNotes: string;
  panels: LabPanel[];
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    birthDate?: string;
    gender?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class LabResultsService {
  constructor(private apiClient: ApiclientService) {}

  create(patientId: string, draft: LabCaptureDraft): Promise<{
    message: string;
    labResult: LabResultRecord;
  }> {
    return this.apiClient.post(
      'lab-results',
      {
        patientId,
        studyDate: draft.studyDate,
        generalNotes: draft.generalNotes,
        panels: draft.panels,
      },
      environment.apiUrl
    );
  }

  update(
    id: string,
    draft: Pick<LabCaptureDraft, 'studyDate' | 'generalNotes' | 'panels'>
  ): Promise<{ message: string; labResult: LabResultRecord }> {
    return this.apiClient.patch(
      `lab-results/${id}`,
      {
        studyDate: draft.studyDate,
        generalNotes: draft.generalNotes,
        panels: draft.panels,
      },
      environment.apiUrl
    );
  }

  getById(id: string): Promise<LabResultRecord> {
    return this.apiClient.get(`lab-results/${id}`, environment.apiUrl);
  }

  listByPatient(
    patientId: string,
    page = 1,
    limit = 20
  ): Promise<{
    total: number;
    page: number;
    limit: number;
    labResults: LabResultRecord[];
  }> {
    return this.apiClient.get(
      `lab-results/patient/${patientId}`,
      environment.apiUrl,
      { params: { page, limit } }
    );
  }

  previewPdf(payload: {
    patientId?: string;
    patientName?: string;
    patientBirthDate?: string;
    patientGender?: string;
    studyDate: string;
    generalNotes?: string;
    panels: LabPanel[];
  }): Promise<Blob> {
    return this.apiClient.postBlob(
      'lab-results/preview-pdf',
      payload,
      environment.apiUrl
    );
  }

  getPdf(id: string): Promise<Blob> {
    return this.apiClient.getBlob(`lab-results/${id}/pdf`, environment.apiUrl);
  }
}
