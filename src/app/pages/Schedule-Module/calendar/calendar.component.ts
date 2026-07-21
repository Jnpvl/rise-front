import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarOptions, EventInput, DateSelectArg, EventDropArg, DatesSetArg, EventClickArg } from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { ShedulesService, Appointment } from '../../../services/shedules.service';
import { PatientsService } from '../../../services/patients.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, CommonModule, FormsModule],
  templateUrl: './calendar.component.html'
})
export class CalendarComponent implements OnInit {

  private scheduleSvc = inject(ShedulesService);
  private patientSvc = inject(PatientsService);
  private authSvc = inject(AuthService);
  private router = inject(Router);

  currentViewType: string = 'month';
  visibleStartDate: Date | null = null;
  visibleEndDate: Date | null = null;
  visibleDateRange: string = '';
  events: EventInput[] = [];
  isLoading: boolean = false;
  activePatients: any[] = [];

  private parseAppointmentId(id: any): string | null {
    if (typeof id === 'string' && id.trim() !== '') {
      return id;
    }

    if (typeof id === 'number') {
      return String(id);
    }

    console.error('Invalid appointment ID:', id, 'Type:', typeof id);
    return null;
  }

  private escapeHtml(value: string | null | undefined): string {
    if (!value) return '';
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      scheduled: 'Programada',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Completada',
      no_show: 'No se presentó'
    };
    return labels[status] || status;
  }

  private getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      scheduled: 'apt-badge-scheduled',
      confirmed: 'apt-badge-confirmed',
      cancelled: 'apt-badge-cancelled',
      completed: 'apt-badge-completed',
      no_show: 'apt-badge-noshow'
    };
    return classes[status] || 'apt-badge-scheduled';
  }

  private formatDateEs(date: string | Date | null | undefined): string {
    if (!date) return '—';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async ngOnInit() {
    try {
      this.activePatients = await this.patientSvc.getActivePatients();
      if (!this.activePatients || this.activePatients.length === 0) {
        console.warn('No se encontraron pacientes activos');
        this.activePatients = [];
      }
    } catch (error) {
      console.error('Error loading active patients:', error);
      this.activePatients = [];
      Swal.fire('Advertencia', 'No se pudieron cargar los pacientes activos', 'warning');
    }
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    locale: esLocale,
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' },
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    height: 'auto',
    events: this.events,
    timeZone: 'local',
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },

    select: (arg: DateSelectArg) => {
      this.openCreateModal(arg.startStr);
    },

    datesSet: (arg: DatesSetArg) => {
      this.currentViewType = arg.view.type;
      this.visibleStartDate = arg.start;
      this.visibleEndDate = arg.end;
      this.formatVisibleDateRange();
      this.loadEventsForDateRange(arg.start, arg.end);
    },

    eventDrop: (arg: EventDropArg) => {
      Swal.fire({
        title: 'Confirmar cambio de fecha',
        text: `¿Desea mover la cita "${arg.event.title}" del ${arg.oldEvent.start?.toLocaleString('es-ES')} al ${arg.event.start?.toLocaleString('es-ES')}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, mover',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#20D0DF',
        cancelButtonColor: '#6b7280'
      }).then((result) => {
        if (result.isConfirmed) {
          this.updateAppointmentDate(arg.event, arg);
        } else {
          arg.revert();
        }
      });
    },

    eventClick: (arg: EventClickArg) => {
      this.openAppointmentModal(arg.event);
    }
  };

  private formatVisibleDateRange(): void {
    if (!this.visibleStartDate || !this.visibleEndDate) return;
    const startDate = new Date(this.visibleStartDate);
    const endDate = new Date(this.visibleEndDate);
    switch (this.currentViewType) {
      case 'dayGridMonth':
        this.visibleDateRange = `${startDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
        break;
      case 'timeGridWeek':
        this.visibleDateRange = `Semana del ${startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} al ${endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        break;
      case 'timeGridDay':
        this.visibleDateRange = startDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        break;
      default:
        this.visibleDateRange = `${startDate.toLocaleDateString('es-ES')} - ${endDate.toLocaleDateString('es-ES')}`;
    }
  }

  private async loadEventsForDateRange(start: Date, end: Date): Promise<void> {
    try {
      this.isLoading = true;
      const res = await this.scheduleSvc.getSchedulesByDateRange(start.toISOString(), end.toISOString());

      this.events = res.appointments.map((appointment: Appointment) => {
        const startDate = new Date(appointment.scheduledDate);
        const endDate = new Date(startDate.getTime() + (appointment.durationMinutes ?? 30) * 60000);

        let color = '#20D0DF';
        if (appointment.status === 'confirmed') color = '#20D0DF';
        if (appointment.status === 'cancelled') color = '#ef4444';
        if (appointment.status === 'completed') color = '#6b7280';
        if (appointment.status === 'no_show') color = '#f59e0b';

        return {
          id: String(appointment.id),
          title: `${appointment.patientName} · ${appointment.doctorName}`,
          start: startDate,
          end: endDate,
          backgroundColor: color,
          borderColor: color,
          extendedProps: {
            status: appointment.status,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            durationMinutes: appointment.durationMinutes,
            scheduledDate: appointment.scheduledDate,
            notes: appointment.notes,
            cancellationReason: appointment.cancellationReason,
            createdByName: appointment.createdByName,
            consultationId: appointment.consultationId,
          }
        } as EventInput;
      });

      this.calendarOptions = { ...this.calendarOptions, events: this.events };
    } finally {
      this.isLoading = false;
    }
  }

  private async openCreateModal(date: string) {
    const { value: formValues } = await Swal.fire({
      title: 'Nueva Cita',
      html: `
        <div class="swal2-form-container">
          <div class="form-group">
            <label for="swal-patient" class="form-label">Paciente:</label>
            <select id="swal-patient" class="swal2-input">
              <option value="">Seleccione un paciente</option>
              ${this.activePatients.map(p => `<option value="${p.id}">${this.escapeHtml(p.firstName)} ${this.escapeHtml(p.lastName)}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="swal-date" class="form-label">Fecha y hora:</label>
            <input id="swal-date" type="datetime-local" class="swal2-input"
                   value="${date.slice(0, 16)}">
          </div>

          <div class="form-group">
            <label for="swal-duration" class="form-label">Duración (minutos):</label>
            <select id="swal-duration" class="swal2-input">
              <option value="15">15 minutos</option>
              <option value="30" selected>30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">1 hora</option>
              <option value="90">1.5 horas</option>
              <option value="120">2 horas</option>
            </select>
          </div>

          <div class="form-group">
            <label for="swal-notes" class="form-label">Notas (opcional):</label>
            <textarea id="swal-notes" class="swal2-textarea" placeholder="Notas adicionales..."></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear Cita',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#20D0DF',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'swal2-custom-popup',
        htmlContainer: 'swal2-custom-html'
      },
      preConfirm: () => {
        const patientId = (document.getElementById('swal-patient') as HTMLSelectElement).value;
        const scheduledDate = (document.getElementById('swal-date') as HTMLInputElement).value;
        const durationMinutes = (document.getElementById('swal-duration') as HTMLSelectElement).value;
        const notes = (document.getElementById('swal-notes') as HTMLTextAreaElement).value;

        if (!patientId) {
          Swal.showValidationMessage('Debe seleccionar un paciente');
          return false;
        }

        if (!scheduledDate) {
          Swal.showValidationMessage('Debe seleccionar fecha y hora');
          return false;
        }

        const selectedDate = new Date(scheduledDate);
        if (selectedDate <= new Date()) {
          Swal.showValidationMessage('La fecha de la cita no puede ser en el pasado');
          return false;
        }

        if (!durationMinutes || parseInt(durationMinutes) < 15) {
          Swal.showValidationMessage('La duración debe ser al menos 15 minutos');
          return false;
        }

        return {
          patientId: patientId,
          scheduledDate: scheduledDate,
          durationMinutes: parseInt(durationMinutes),
          notes: notes
        };
      }
    });

    if (formValues) {
      try {
        const currentUser = this.authSvc.getUser();
        if (!currentUser) {
          Swal.fire('Error', 'No se encontró el usuario logueado', 'error');
          return;
        }

        await this.scheduleSvc.createSchedule({
          patientId: formValues.patientId,
          doctorId: currentUser.id,
          scheduledDate: formValues.scheduledDate,
          durationMinutes: formValues.durationMinutes,
          notes: formValues.notes
        });

        Swal.fire('Éxito', 'Cita creada correctamente', 'success');
        this.loadEventsForDateRange(this.visibleStartDate!, this.visibleEndDate!);
      } catch (error: any) {
        console.error('Error creating appointment:', error);

        let errorMessage = 'No se pudo crear la cita';

        if (error.status === 400) {
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
        } else if (error.status === 409) {
          errorMessage = 'Conflicto de horario: El doctor ya tiene una cita programada en ese horario';
        } else if (error.status === 500) {
          errorMessage = 'Error interno del servidor';
        }

        Swal.fire('Error', errorMessage, 'error');
      }
    }
  }

  async openAppointmentModal(event: any) {
    try {
      const appointmentId = this.parseAppointmentId(event.id);
      if (appointmentId === null) {
        Swal.fire('Error', 'ID de cita inválido', 'error');
        return;
      }

      Swal.fire({
        title: 'Cargando...',
        text: 'Obteniendo información de la cita',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const appointmentData = await this.scheduleSvc.getAppointmentById(appointmentId);
      Swal.close();

      const status = appointmentData.status || 'scheduled';
      const isClosed = status === 'completed' || status === 'cancelled';
      const statusLabel = this.getStatusLabel(status);
      const badgeClass = this.getStatusBadgeClass(status);
      const patientName = this.escapeHtml(appointmentData.patientName || '—');
      const doctorName = this.escapeHtml(appointmentData.doctorName || '—');
      const createdByName = this.escapeHtml(appointmentData.createdByName || '—');
      const notes = this.escapeHtml(appointmentData.notes || '');
      const cancellationReason = this.escapeHtml(appointmentData.cancellationReason || '');
      const formattedDate = this.formatDateEs(appointmentData.scheduledDate);
      const duration = appointmentData.durationMinutes ?? 30;

      const result = await Swal.fire({
        html: `
          <div class="apt-view">
            <div class="apt-view-header">
              <p class="apt-view-kicker">Detalle de cita</p>
              <h2 class="apt-view-title">${patientName}</h2>
              <span class="apt-badge ${badgeClass}">${statusLabel}</span>
            </div>
            <div class="apt-view-grid">
              <div class="apt-view-item">
                <span class="apt-view-label">Doctor</span>
                <span class="apt-view-value">${doctorName}</span>
              </div>
              <div class="apt-view-item">
                <span class="apt-view-label">Fecha y hora</span>
                <span class="apt-view-value">${formattedDate}</span>
              </div>
              <div class="apt-view-item">
                <span class="apt-view-label">Duración</span>
                <span class="apt-view-value">${duration} minutos</span>
              </div>
              <div class="apt-view-item">
                <span class="apt-view-label">Agendó</span>
                <span class="apt-view-value">${createdByName}</span>
              </div>
            </div>
            ${appointmentData.consultationId
              ? '<p class="apt-view-origin">Origen: consulta médica</p>'
              : ''}
            ${notes
              ? `<div class="apt-view-notes"><span class="apt-view-label">Notas</span><p>${notes}</p></div>`
              : ''}
            ${status === 'cancelled' && cancellationReason
              ? `<div class="apt-view-notes apt-view-cancel"><span class="apt-view-label">Motivo de cancelación</span><p>${cancellationReason}</p></div>`
              : ''}
          </div>
        `,
        showDenyButton: true,
        showCancelButton: true,
        showConfirmButton: !isClosed,
        denyButtonText: 'Ir a consulta',
        confirmButtonText: 'Editar',
        cancelButtonText: 'Cerrar',
        denyButtonColor: '#E540AE',
        confirmButtonColor: '#20D0DF',
        cancelButtonColor: '#6b7280',
        customClass: {
          popup: 'apt-view-popup',
          htmlContainer: 'swal2-custom-html'
        }
      });

      if (result.isDenied) {
        this.router.navigate(['/admin/consultation'], {
          queryParams: {
            patientId: appointmentData.patientId,
            doctorId: appointmentData.doctorId,
            appointmentId: appointmentId
          }
        });
        return;
      }

      if (result.isConfirmed && !isClosed) {
        await this.openEditFormModal(appointmentId, appointmentData);
      }
    } catch (error: any) {
      console.error('Error loading appointment data:', error);
      Swal.fire('Error', 'No se pudo cargar la información de la cita', 'error');
    }
  }

  async openEditFormModal(appointmentId: string, appointmentData: Appointment) {
    try {
      const { value: formValues } = await Swal.fire({
        title: 'Editar Cita',
        html: `
          <div class="swal2-form-container">
            <div class="form-group" style="background:#f8fafc;padding:10px 12px;border-radius:8px;margin-bottom:12px;text-align:left;">
              <div style="font-size:12px;color:#64748b;margin-bottom:4px;">Detalle de la cita</div>
              <div style="font-size:13px;"><strong>Doctor:</strong> ${this.escapeHtml(appointmentData.doctorName || '—')}</div>
              <div style="font-size:13px;"><strong>Agendó:</strong> ${this.escapeHtml(appointmentData.createdByName || '—')}</div>
              ${appointmentData.consultationId ? '<div style="font-size:12px;color:#64748b;margin-top:4px;">Origen: consulta médica</div>' : ''}
            </div>
            <div class="form-group">
              <label for="swal-patient" class="form-label">Paciente:</label>
              <select id="swal-patient" class="swal2-input">
                ${this.activePatients.map(p =>
                  `<option value="${p.id}" ${p.id === appointmentData.patientId ? 'selected' : ''}>
                    ${this.escapeHtml(p.firstName)} ${this.escapeHtml(p.lastName)}
                  </option>`
                ).join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="swal-date" class="form-label">Fecha y hora:</label>
              <input id="swal-date" type="datetime-local" class="swal2-input"
                     value="${appointmentData.scheduledDate.slice(0, 16)}">
            </div>

            <div class="form-group">
              <label for="swal-duration" class="form-label">Duración (minutos):</label>
              <select id="swal-duration" class="swal2-input">
                <option value="15" ${appointmentData.durationMinutes === 15 ? 'selected' : ''}>15 minutos</option>
                <option value="30" ${appointmentData.durationMinutes === 30 ? 'selected' : ''}>30 minutos</option>
                <option value="45" ${appointmentData.durationMinutes === 45 ? 'selected' : ''}>45 minutos</option>
                <option value="60" ${appointmentData.durationMinutes === 60 ? 'selected' : ''}>1 hora</option>
                <option value="90" ${appointmentData.durationMinutes === 90 ? 'selected' : ''}>1.5 horas</option>
                <option value="120" ${appointmentData.durationMinutes === 120 ? 'selected' : ''}>2 horas</option>
              </select>
            </div>

            <div class="form-group">
              <label for="swal-status" class="form-label">Estado:</label>
              <select id="swal-status" class="swal2-input">
                <option value="scheduled" ${appointmentData.status === 'scheduled' ? 'selected' : ''}>Programada</option>
                <option value="confirmed" ${appointmentData.status === 'confirmed' ? 'selected' : ''}>Confirmada</option>
                <option value="cancelled" ${appointmentData.status === 'cancelled' ? 'selected' : ''}>Cancelada</option>
                <option value="completed" ${appointmentData.status === 'completed' ? 'selected' : ''}>Completada</option>
                <option value="no_show" ${appointmentData.status === 'no_show' ? 'selected' : ''}>No se presentó</option>
              </select>
            </div>

            <div class="form-group">
              <label for="swal-notes" class="form-label">Notas:</label>
              <textarea id="swal-notes" class="swal2-textarea" placeholder="Notas adicionales...">${this.escapeHtml(appointmentData.notes || '')}</textarea>
            </div>

            <div class="form-group" id="cancellation-reason-group" style="display: none;">
              <label for="swal-cancellation-reason" class="form-label">Motivo de cancelación:</label>
              <textarea id="swal-cancellation-reason" class="swal2-textarea" placeholder="Especifique el motivo...">${this.escapeHtml(appointmentData.cancellationReason || '')}</textarea>
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Actualizar Cita',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#20D0DF',
        cancelButtonColor: '#6b7280',
        customClass: {
          popup: 'swal2-custom-popup',
          htmlContainer: 'swal2-custom-html'
        },
        didOpen: () => {
          const statusSelect = document.getElementById('swal-status') as HTMLSelectElement;
          const cancellationGroup = document.getElementById('cancellation-reason-group') as HTMLElement;

          const toggleCancellationReason = () => {
            if (statusSelect.value === 'cancelled') {
              cancellationGroup.style.display = 'block';
            } else {
              cancellationGroup.style.display = 'none';
            }
          };

          statusSelect.addEventListener('change', toggleCancellationReason);
          toggleCancellationReason();
        },
        preConfirm: () => {
          const patientId = (document.getElementById('swal-patient') as HTMLSelectElement).value;
          const scheduledDate = (document.getElementById('swal-date') as HTMLInputElement).value;
          const durationMinutes = (document.getElementById('swal-duration') as HTMLSelectElement).value;
          const status = (document.getElementById('swal-status') as HTMLSelectElement).value;
          const notes = (document.getElementById('swal-notes') as HTMLTextAreaElement).value;
          const cancellationReason = (document.getElementById('swal-cancellation-reason') as HTMLTextAreaElement).value;

          if (!patientId) {
            Swal.showValidationMessage('Debe seleccionar un paciente');
            return false;
          }

          if (!scheduledDate) {
            Swal.showValidationMessage('Debe seleccionar fecha y hora');
            return false;
          }

          const selectedDate = new Date(scheduledDate);
          if (selectedDate <= new Date()) {
            Swal.showValidationMessage('La fecha de la cita no puede ser en el pasado');
            return false;
          }

          if (!durationMinutes || parseInt(durationMinutes) < 15) {
            Swal.showValidationMessage('La duración debe ser al menos 15 minutos');
            return false;
          }

          if (status === 'cancelled' && !cancellationReason.trim()) {
            Swal.showValidationMessage('Debe especificar el motivo de cancelación');
            return false;
          }

          return {
            patientId: patientId,
            scheduledDate: scheduledDate,
            durationMinutes: parseInt(durationMinutes),
            status: status,
            notes: notes,
            cancellationReason: status === 'cancelled' ? cancellationReason : undefined
          };
        }
      });

      if (formValues) {
        try {
          await this.scheduleSvc.updateSchedule(appointmentId, {
            patientId: formValues.patientId,
            doctorId: appointmentData.doctorId,
            scheduledDate: formValues.scheduledDate,
            durationMinutes: formValues.durationMinutes,
            status: formValues.status,
            notes: formValues.notes,
            cancellationReason: formValues.cancellationReason
          });

          Swal.fire('Éxito', 'Cita actualizada correctamente', 'success');
          this.loadEventsForDateRange(this.visibleStartDate!, this.visibleEndDate!);
        } catch (error: any) {
          console.error('Error updating appointment:', error);

          let errorMessage = 'No se pudo actualizar la cita';

          if (error.status === 400) {
            if (error.error?.message) {
              errorMessage = error.error.message;
            }
          } else if (error.status === 404) {
            errorMessage = 'La cita no fue encontrada';
          } else if (error.status === 409) {
            errorMessage = 'Conflicto de horario: El doctor ya tiene una cita programada en ese horario';
          } else if (error.status === 500) {
            errorMessage = 'Error interno del servidor';
          }

          Swal.fire('Error', errorMessage, 'error');
        }
      }
    } catch (error: any) {
      console.error('Error opening edit form:', error);
      Swal.fire('Error', 'No se pudo abrir el formulario de edición', 'error');
    }
  }

  private async updateAppointmentDate(event: any, arg: EventDropArg): Promise<void> {
    try {
      const currentStatus = event.extendedProps?.status;
      if (currentStatus === 'completed' || currentStatus === 'cancelled') {
        Swal.fire('Error', 'No se puede modificar una cita completada o cancelada', 'error');
        arg.revert();
        return;
      }

      const appointmentId = this.parseAppointmentId(event.id);
      if (appointmentId === null) {
        Swal.fire('Error', 'ID de cita inválido para actualizar fecha', 'error');
        arg.revert();
        return;
      }

      const doctorId = event.extendedProps?.doctorId;
      if (!doctorId) {
        Swal.fire('Error', 'No se encontró el doctor de la cita', 'error');
        arg.revert();
        return;
      }

      const newDate = event.start as Date;
      const pad = (n: number) => String(n).padStart(2, '0');
      const newDateString = `${newDate.getFullYear()}-${pad(newDate.getMonth() + 1)}-${pad(newDate.getDate())}T${pad(newDate.getHours())}:${pad(newDate.getMinutes())}`;

      await this.scheduleSvc.updateSchedule(appointmentId, {
        scheduledDate: newDateString,
        doctorId
      });

      Swal.fire('Éxito', 'Fecha de la cita actualizada correctamente', 'success');

      this.loadEventsForDateRange(this.visibleStartDate!, this.visibleEndDate!);

    } catch (error: any) {
      console.error('Error updating appointment date:', error);

      let errorMessage = 'No se pudo actualizar la fecha de la cita';

      if (error.status === 400) {
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
      } else if (error.status === 404) {
        errorMessage = 'La cita no fue encontrada';
      } else if (error.status === 409) {
        errorMessage = 'Conflicto de horario: El doctor ya tiene una cita programada en ese horario';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      }

      Swal.fire('Error', errorMessage, 'error');

      arg.revert();
    }
  }

  getTotalAppointmentsCount(): number {
    return this.events.length;
  }

  getConfirmedAppointmentsCount(): number {
    return this.events.filter(e => e.extendedProps?.['status'] === 'confirmed').length;
  }

  getScheduledAppointmentsCount(): number {
    return this.events.filter(e => e.extendedProps?.['status'] === 'scheduled').length;
  }

  getCancelledAppointmentsCount(): number {
    return this.events.filter(e => e.extendedProps?.['status'] === 'cancelled').length;
  }

  getCompletedAppointmentsCount(): number {
    return this.events.filter(e => e.extendedProps?.['status'] === 'completed').length;
  }

  getNoShowAppointmentsCount(): number {
    return this.events.filter(e => e.extendedProps?.['status'] === 'no_show').length;
  }
}
