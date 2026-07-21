import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService, DashboardSummary } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  isLoading = true;
  errorMessage = '';
  summary: DashboardSummary = {
    patientsTotal: 0,
    patientsActive: 0,
    appointmentsToday: 0,
    consultationsTotal: 0,
    staffActive: 0,
    upcomingAppointments: [],
  };

  ngOnInit(): void {
    this.loadSummary();
  }

  async loadSummary(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.summary = await this.dashboardService.getSummary();
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      this.errorMessage = 'No se pudo cargar el resumen. Intenta de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  formatAppointmentDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      scheduled: 'Programada',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Completada',
      no_show: 'No asistió',
    };
    return map[status] || status;
  }
}
