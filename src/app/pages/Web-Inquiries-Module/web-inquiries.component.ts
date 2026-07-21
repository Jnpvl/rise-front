import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  APPOINTMENT_STATUSES,
  CONTACT_STATUSES,
  WebInquiry,
  WebInquiryStatus,
  WebInquiryType,
  WebInquiryService,
} from '../../services/web-inquiry.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-web-inquiries',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './web-inquiries.component.html',
})
export class WebInquiriesComponent implements OnInit {
  private readonly webInquiryService = inject(WebInquiryService);

  activeTab: WebInquiryType | 'all' = 'appointment';
  isLoading = false;
  items: WebInquiry[] = [];
  searchTerm = '';

  ngOnInit(): void {
    void this.load();
  }

  get filteredItems(): WebInquiry[] {
    const term = this.searchTerm.trim().toLowerCase();
    let list = this.items;

    if (this.activeTab !== 'all') {
      list = list.filter((item) => item.type === this.activeTab);
    }

    if (!term) return list;

    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.phone.toLowerCase().includes(term) ||
        (item.email || '').toLowerCase().includes(term) ||
        (item.reason || '').toLowerCase().includes(term) ||
        (item.message || '').toLowerCase().includes(term)
    );
  }

  get pendingCount(): number {
    return this.items.filter((i) => this.normalizeStatus(i) === 'pending')
      .length;
  }

  async load(): Promise<void> {
    this.isLoading = true;
    try {
      this.items = await this.webInquiryService.list();
    } catch {
      this.items = [];
      Swal.fire('Error', 'No se pudieron cargar las solicitudes', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  setTab(tab: WebInquiryType | 'all'): void {
    this.activeTab = tab;
  }

  statusOptionsFor(item: WebInquiry) {
    return item.type === 'contact' ? CONTACT_STATUSES : APPOINTMENT_STATUSES;
  }

  normalizeStatus(item: WebInquiry): WebInquiryStatus {
    const status = item.status;
    if (item.type === 'contact') {
      if (status === 'resolved') return 'resolved';
      return 'pending';
    }
    if (status === 'scheduled' || status === 'cancelled') return status;
    return 'pending';
  }

  statusLabel(item: WebInquiry): string {
    const normalized = this.normalizeStatus(item);
    return (
      this.statusOptionsFor(item).find((option) => option.value === normalized)
        ?.label || 'Pendiente'
    );
  }

  formatDate(value: string | null): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  async onStatusChange(
    item: WebInquiry,
    status: WebInquiryStatus
  ): Promise<void> {
    const previous = item.status;
    if (this.normalizeStatus(item) === status) return;

    item.status = status;
    try {
      const updated = await this.webInquiryService.updateStatus(item.id, status);
      this.items = this.items.map((row) =>
        row.id === item.id ? updated : row
      );
    } catch {
      item.status = previous;
      Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
    }
  }

  async viewDetail(item: WebInquiry): Promise<void> {
    const isAppointment = item.type === 'appointment';
    const body = isAppointment
      ? `
        <div style="text-align:left">
          <p><strong>Teléfono:</strong> ${item.phone}</p>
          <p><strong>Fecha preferida:</strong> ${this.formatDate(item.preferredDate)}</p>
          <p><strong>Motivo:</strong><br>${item.reason || '—'}</p>
          <p><strong>Estado:</strong> ${this.statusLabel(item)}</p>
          <p><strong>Recibida:</strong> ${this.formatDate(item.createdAt)}</p>
        </div>
      `
      : `
        <div style="text-align:left">
          <p><strong>Teléfono:</strong> ${item.phone}</p>
          <p><strong>Correo:</strong> ${item.email || '—'}</p>
          <p><strong>Mensaje:</strong><br>${item.message || '—'}</p>
          <p><strong>Estado:</strong> ${this.statusLabel(item)}</p>
          <p><strong>Recibida:</strong> ${this.formatDate(item.createdAt)}</p>
        </div>
      `;

    await Swal.fire({
      title: item.name,
      html: body,
      confirmButtonText: 'Cerrar',
      width: 520,
    });
  }
}
