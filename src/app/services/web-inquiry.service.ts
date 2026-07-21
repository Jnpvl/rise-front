import { Injectable } from '@angular/core';
import { ApiclientService } from './apiclient.service';
import { environment } from '../../environments/environment';

export type WebInquiryType = 'appointment' | 'contact';
export type WebInquiryStatus =
  | 'pending'
  | 'scheduled'
  | 'cancelled'
  | 'resolved';

export interface WebInquiry {
  id: string;
  type: WebInquiryType;
  name: string;
  phone: string;
  email: string | null;
  preferredDate: string | null;
  reason: string | null;
  message: string | null;
  status: WebInquiryStatus | string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentInquiryPayload = {
  name: string;
  phone: string;
  preferredDate?: string;
  reason?: string;
};

export type ContactInquiryPayload = {
  name: string;
  phone: string;
  email?: string;
  message: string;
};

export const APPOINTMENT_STATUSES: {
  value: WebInquiryStatus;
  label: string;
}[] = [
  { value: 'pending', label: 'Pendiente revisión' },
  { value: 'scheduled', label: 'Agendada' },
  { value: 'cancelled', label: 'Cancelada' },
];

export const CONTACT_STATUSES: {
  value: WebInquiryStatus;
  label: string;
}[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'resolved', label: 'Resuelta' },
];

@Injectable({
  providedIn: 'root',
})
export class WebInquiryService {
  constructor(private readonly apiClient: ApiclientService) {}

  submitAppointment(
    data: AppointmentInquiryPayload
  ): Promise<{ message: string; inquiry: WebInquiry }> {
    return this.apiClient.post<{ message: string; inquiry: WebInquiry }>(
      'web-inquiries/appointments',
      data,
      environment.apiUrl
    );
  }

  submitContact(
    data: ContactInquiryPayload
  ): Promise<{ message: string; inquiry: WebInquiry }> {
    return this.apiClient.post<{ message: string; inquiry: WebInquiry }>(
      'web-inquiries/contacts',
      data,
      environment.apiUrl
    );
  }

  list(type?: WebInquiryType): Promise<WebInquiry[]> {
    const params = type ? { type } : undefined;
    return this.apiClient.get<WebInquiry[]>(
      'web-inquiries',
      environment.apiUrl,
      params ? { params } : undefined
    );
  }

  updateStatus(id: string, status: WebInquiryStatus): Promise<WebInquiry> {
    return this.apiClient.patch<WebInquiry>(
      `web-inquiries/${id}/status`,
      { status },
      environment.apiUrl
    );
  }
}
