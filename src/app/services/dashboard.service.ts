import { Injectable } from '@angular/core';
import { ApiclientService } from './apiclient.service';
import { environment } from '../../environments/environment';

export interface DashboardSummary {
  patientsTotal: number;
  patientsActive: number;
  appointmentsToday: number;
  consultationsTotal: number;
  staffActive: number;
  upcomingAppointments: Array<{
    id: string;
    patientName: string;
    doctorName: string;
    scheduledDate: string;
    status: string;
    createdByName?: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private apiClient: ApiclientService) {}

  getSummary(): Promise<DashboardSummary> {
    return this.apiClient.get<DashboardSummary>('dashboard/summary', environment.apiUrl);
  }
}
