import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { StaffService, StaffMember } from '../../services/staff.service';
import Swal from 'sweetalert2';

type SignaturePadState = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  drawing: boolean;
  hasInk: boolean;
  clear: () => void;
  toDataUrl: () => string | undefined;
};

function setupSignaturePad(
  canvas: HTMLCanvasElement,
  existingDataUrl?: string
): SignaturePadState | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 420;
  const height = 140;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#15202b';

  const paintBackground = () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  };
  paintBackground();

  const state: SignaturePadState = {
    canvas,
    ctx,
    drawing: false,
    hasInk: false,
    clear: () => {
      paintBackground();
      state.hasInk = false;
    },
    toDataUrl: () => (state.hasInk ? canvas.toDataURL('image/png') : undefined),
  };

  if (existingDataUrl) {
    const img = new Image();
    img.onload = () => {
      paintBackground();
      ctx.drawImage(img, 0, 0, width, height);
      state.hasInk = true;
    };
    img.src = existingDataUrl;
  }

  const point = (event: MouseEvent | TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in event) {
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const start = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    state.drawing = true;
    const p = point(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const move = (event: MouseEvent | TouchEvent) => {
    if (!state.drawing) return;
    event.preventDefault();
    const p = point(event);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    state.hasInk = true;
  };

  const end = () => {
    state.drawing = false;
  };

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup', end);
  canvas.addEventListener('mouseleave', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', end);

  return state;
}

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './staff.component.html',
})
export class StaffComponent implements OnInit {
  staffList: StaffMember[] = [];
  isLoading = false;
  searchTerm = '';

  private staffService = inject(StaffService);
  private signaturePad: SignaturePadState | null = null;

  ngOnInit(): void {
    this.loadStaff();
  }

  get filteredStaff(): StaffMember[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.staffList;
    return this.staffList.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        (s.cedula || '').toLowerCase().includes(term)
    );
  }

  async loadStaff(): Promise<void> {
    this.isLoading = true;
    try {
      this.staffList = await this.staffService.getAllStaff();
    } catch {
      this.staffList = [];
      Swal.fire('Error', 'No se pudo cargar el personal', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  private signatureFieldHtml(existing?: string): string {
    const preview = existing
      ? `<img id="staff-signature-preview" src="${existing}" alt="Firma actual" style="max-height:48px;margin-bottom:8px;display:block;" />`
      : '';
    return `
      <div class="form-group" style="margin-top:12px">
        <label class="form-label">Firma manuscrita</label>
        ${preview}
        <canvas
          id="staff-signature"
          style="width:100%;height:140px;border:1px solid #d1d5db;border-radius:10px;background:#fff;touch-action:none;cursor:crosshair;"
        ></canvas>
        <button type="button" id="staff-signature-clear" class="swal2-cancel swal2-styled" style="margin-top:8px;background:#6b7280;">
          Limpiar firma
        </button>
        <p style="font-size:12px;color:#6b7280;margin:8px 0 0;">Firma en el recuadro (se usará en documentos de laboratorio).</p>
      </div>
    `;
  }

  private bindSignaturePad(existing?: string): void {
    const canvas = document.getElementById('staff-signature') as HTMLCanvasElement | null;
    if (!canvas) {
      this.signaturePad = null;
      return;
    }
    this.signaturePad = setupSignaturePad(canvas, existing);
    const clearBtn = document.getElementById('staff-signature-clear');
    clearBtn?.addEventListener('click', (event) => {
      event.preventDefault();
      this.signaturePad?.clear();
      const preview = document.getElementById('staff-signature-preview');
      preview?.remove();
    });
  }

  async openCreateModal(): Promise<void> {
    const { value } = await Swal.fire({
      title: 'Nuevo miembro del staff',
      width: 560,
      html: `
        <div class="swal2-form-container" style="text-align:left">
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">Nombre completo</label>
            <input id="staff-name" class="swal2-input" placeholder="Ej. Dra. Ana López">
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">Correo</label>
            <input id="staff-email" type="email" class="swal2-input" placeholder="correo@clinica.com">
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">Contraseña</label>
            <input id="staff-password" type="password" class="swal2-input" placeholder="Mínimo 6 caracteres">
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">Rol</label>
            <select id="staff-role" class="swal2-input">
              <option value="admin">Admin / Médico</option>
              <option value="auxiliar">Auxiliar</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Cédula profesional (opcional)</label>
            <input id="staff-cedula" class="swal2-input" placeholder="Cédula">
          </div>
          ${this.signatureFieldHtml()}
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#E540AE',
      cancelButtonColor: '#6b7280',
      didOpen: () => this.bindSignaturePad(),
      preConfirm: () => {
        const name = (document.getElementById('staff-name') as HTMLInputElement).value.trim();
        const email = (document.getElementById('staff-email') as HTMLInputElement).value.trim();
        const password = (document.getElementById('staff-password') as HTMLInputElement).value;
        const role = (document.getElementById('staff-role') as HTMLSelectElement).value;
        const cedula = (document.getElementById('staff-cedula') as HTMLInputElement).value.trim();
        const signatureDataUrl = this.signaturePad?.toDataUrl();

        if (!name || !email || !password || !role) {
          Swal.showValidationMessage('Nombre, correo, contraseña y rol son obligatorios');
          return false;
        }
        if (password.length < 6) {
          Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
          return false;
        }
        return {
          name,
          email,
          password,
          role,
          cedula: cedula || undefined,
          signatureDataUrl,
        };
      },
    });

    this.signaturePad = null;
    if (!value) return;

    try {
      await this.staffService.createStaff(value);
      await this.loadStaff();
      Swal.fire('Listo', 'Staff registrado correctamente', 'success');
    } catch (error: any) {
      Swal.fire('Error', error?.error?.message || 'No se pudo registrar el staff', 'error');
    }
  }

  async openEditModal(member: StaffMember): Promise<void> {
    const existingSignature = member.signatureDataUrl || '';
    const { value } = await Swal.fire({
      title: 'Editar staff',
      width: 560,
      html: `
        <div class="swal2-form-container" style="text-align:left">
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">Nombre completo</label>
            <input id="staff-name" class="swal2-input" value="${member.name.replace(/"/g, '&quot;')}">
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">Correo</label>
            <input id="staff-email" type="email" class="swal2-input" value="${member.email.replace(/"/g, '&quot;')}">
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">Nueva contraseña (opcional)</label>
            <input id="staff-password" type="password" class="swal2-input" placeholder="Dejar vacío para no cambiar">
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">Rol</label>
            <select id="staff-role" class="swal2-input">
              <option value="admin" ${member.role === 'admin' ? 'selected' : ''}>Admin / Médico</option>
              <option value="auxiliar" ${member.role === 'auxiliar' ? 'selected' : ''}>Auxiliar</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">Cédula profesional</label>
            <input id="staff-cedula" class="swal2-input" value="${(member.cedula || '').replace(/"/g, '&quot;')}">
          </div>
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select id="staff-active" class="swal2-input">
              <option value="true" ${member.isActive ? 'selected' : ''}>Activo</option>
              <option value="false" ${!member.isActive ? 'selected' : ''}>Inactivo</option>
            </select>
          </div>
          ${this.signatureFieldHtml(existingSignature)}
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#20D0DF',
      cancelButtonColor: '#6b7280',
      didOpen: () => this.bindSignaturePad(existingSignature),
      preConfirm: () => {
        const name = (document.getElementById('staff-name') as HTMLInputElement).value.trim();
        const email = (document.getElementById('staff-email') as HTMLInputElement).value.trim();
        const password = (document.getElementById('staff-password') as HTMLInputElement).value;
        const role = (document.getElementById('staff-role') as HTMLSelectElement).value;
        const cedula = (document.getElementById('staff-cedula') as HTMLInputElement).value.trim();
        const isActive = (document.getElementById('staff-active') as HTMLSelectElement).value === 'true';
        const drawn = this.signaturePad?.toDataUrl();

        if (!name || !email || !role) {
          Swal.showValidationMessage('Nombre, correo y rol son obligatorios');
          return false;
        }

        const payload: any = {
          name,
          email,
          role,
          cedula,
          isActive,
          signatureDataUrl: drawn || existingSignature || '',
        };
        if (password) payload.password = password;
        return payload;
      },
    });

    this.signaturePad = null;
    if (!value) return;

    try {
      await this.staffService.updateStaff(member.id, value);
      await this.loadStaff();
      Swal.fire('Listo', 'Staff actualizado correctamente', 'success');
    } catch (error: any) {
      Swal.fire('Error', error?.error?.message || 'No se pudo actualizar el staff', 'error');
    }
  }

  async deactivate(member: StaffMember): Promise<void> {
    const confirm = await Swal.fire({
      title: 'Desactivar staff',
      text: `¿Desactivar a ${member.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    });

    if (!confirm.isConfirmed) return;

    try {
      await this.staffService.deactivateStaff(member.id);
      await this.loadStaff();
      Swal.fire('Listo', 'Staff desactivado', 'success');
    } catch (error: any) {
      Swal.fire('Error', error?.error?.message || 'No se pudo desactivar', 'error');
    }
  }

  roleLabel(role: string): string {
    return role === 'auxiliar' ? 'Auxiliar' : 'Admin / Médico';
  }
}
