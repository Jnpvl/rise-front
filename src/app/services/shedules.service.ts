import { Injectable } from '@angular/core';
import { ApiclientService } from './apiclient.service';
import { environment } from '../../environments/environment';

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  scheduledDate: string;
  durationMinutes: number;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  patientId: string;
  doctorId: string;
  notes?: string;
  cancellationReason?: string;
  createdById?: string;
  createdByName?: string;
  consultationId?: string;
}

export interface AppointmentResponse {
  appointments: Appointment[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ShedulesService {

  constructor(
    private apiClient: ApiclientService
  ) { }

  // Obtener citas por rango de fechas
  getSchedulesByDateRange(startDate: string, endDate: string) {
    const params = {
      startDate,
      endDate
    };
    return this.apiClient.get<AppointmentResponse>('appointments/', environment.apiUrl, { params });
  }

  // Obtener una cita específica por ID
  getAppointmentById(id: string) {
    return this.apiClient.get<Appointment>(`appointments/${id}`, environment.apiUrl);
  }

  // Crear una nueva cita
  createSchedule(scheduleData: any) {
    return this.apiClient.post<any>('appointments/create', scheduleData, environment.apiUrl);
  }

  // Actualizar una cita existente
  updateSchedule(id: string, scheduleData: any) {
    return this.apiClient.patch<any>(`appointments/${id}`, scheduleData, environment.apiUrl);
  }

  // Eliminar una cita
  deleteSchedule(id: string) {
    return this.apiClient.delete(`appointments/${id}/`, environment.apiUrl);
  }
}
