import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  PLATFORM_ID,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ClinicSettings,
  ClinicSettingsService,
} from '../../services/clinic-settings.service';
import { WebInquiryService } from '../../services/web-inquiry.service';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { seoCopy } from '../../data/servicios-data';
import { CLINIC_DEFAULTS, CLINIC_EMAIL, CLINIC_INSTAGRAM } from '../../core/clinic-defaults';

const LANDING_SECTIONS = ['servicios', 'experiencia', 'agenda', 'contacto'] as const;
type LandingSection = (typeof LANDING_SECTIONS)[number];

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './landing.component.html',
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly webInquiryService = inject(WebInquiryService);

  readonly currentYear = new Date().getFullYear();
  readonly homeCopy = seoCopy.home;
  readonly servicePages = seoCopy.pages;
  readonly whereWhenHtml = seoCopy.donde_cuando_html;
  readonly clinicEmail = CLINIC_EMAIL;
  readonly clinicInstagram = CLINIC_INSTAGRAM;
  submittingAppointment = false;
  submittingContact = false;

  clinic: ClinicSettings = { ...CLINIC_DEFAULTS };

  contactForm = {
    name: '',
    phone: '',
    email: '',
    message: '',
  };

  appointmentForm = {
    name: '',
    phone: '',
    preferredDate: '',
    reason: '',
  };

  get whatsappHref(): string {
    const digits = this.clinic.whatsapp.replace(/\D/g, '');
    if (!digits) return '';
    return `https://wa.me/${digits.startsWith('52') ? digits : `52${digits}`}`;
  }

  serviceSummary(bodyHtml: string): string {
    const firstParagraph = bodyHtml.match(/<p>([\s\S]*?)<\/p>/i)?.[1] ?? bodyHtml;
    return firstParagraph.replace(/<[^>]+>/g, '').trim();
  }

  get facebookHref(): string {
    const url = this.clinic.facebookUrl.trim();
    if (!url) return '';
    const withoutProtocol = url.replace(/^https?:\/\//i, '');
    return `https://${withoutProtocol}`;
  }

  private observer?: IntersectionObserver;
  private currentPath = '/';
  private ignoreObserverUntil = 0;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) void this.loadClinicSettings();
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.currentPath = this.normalizePath(this.router.url);
    this.setupScrollSpy();
    queueMicrotask(() => this.scrollToPath(this.currentPath, false));
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  goToSection(event: Event, section: LandingSection) {
    event.preventDefault();
    this.ignoreObserverUntil = Date.now() + 900;
    this.syncUrl(`/${section}`);
    this.scrollToPath(`/${section}`, true);
  }

  async onContactSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.submittingContact) return;

    if (!this.contactForm.name.trim() || !this.contactForm.phone.trim() || !this.contactForm.message.trim()) {
      Swal.fire('Faltan datos', 'Nombre, teléfono y mensaje son obligatorios.', 'warning');
      return;
    }

    this.submittingContact = true;
    try {
      const result = await this.webInquiryService.submitContact({
        name: this.contactForm.name.trim(),
        phone: this.contactForm.phone.trim(),
        email: this.contactForm.email.trim() || undefined,
        message: this.contactForm.message.trim(),
      });
      this.contactForm = { name: '', phone: '', email: '', message: '' };
      Swal.fire({
        icon: 'success',
        title: 'Mensaje enviado',
        text: result.message,
        timer: 2500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire('Error', 'No se pudo enviar el mensaje. Intenta de nuevo.', 'error');
    } finally {
      this.submittingContact = false;
    }
  }

  async onAppointmentSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.submittingAppointment) return;

    if (!this.appointmentForm.name.trim() || !this.appointmentForm.phone.trim()) {
      Swal.fire('Faltan datos', 'Nombre y teléfono son obligatorios.', 'warning');
      return;
    }

    this.submittingAppointment = true;
    try {
      const result = await this.webInquiryService.submitAppointment({
        name: this.appointmentForm.name.trim(),
        phone: this.appointmentForm.phone.trim(),
        preferredDate: this.appointmentForm.preferredDate || undefined,
        reason: this.appointmentForm.reason.trim() || undefined,
      });
      this.appointmentForm = {
        name: '',
        phone: '',
        preferredDate: '',
        reason: '',
      };
      Swal.fire({
        icon: 'success',
        title: 'Solicitud enviada',
        text: result.message,
        timer: 2500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire(
        'Error',
        'No se pudo enviar la solicitud. Intenta de nuevo.',
        'error'
      );
    } finally {
      this.submittingAppointment = false;
    }
  }

  private async loadClinicSettings(): Promise<void> {
    try {
      const settings: ClinicSettings = await this.clinicSettingsService.get();
      this.clinic = {
        horario: settings.horario || CLINIC_DEFAULTS.horario,
        telefono: settings.telefono || CLINIC_DEFAULTS.telefono,
        whatsapp: settings.whatsapp || CLINIC_DEFAULTS.whatsapp,
        ubicacion: settings.ubicacion || CLINIC_DEFAULTS.ubicacion,
        facebookUrl: settings.facebookUrl || CLINIC_DEFAULTS.facebookUrl,
      };
    } catch {
      // Keep empty placeholders if API is unavailable
    }
  }

  private setupScrollSpy() {
    if (!isPlatformBrowser(this.platformId)) return;
    const hero = document.getElementById('inicio');
    const sections = LANDING_SECTIONS.map((id) =>
      document.getElementById(id)
    ).filter((el): el is HTMLElement => !!el);

    const targets = [hero, ...sections].filter(
      (el): el is HTMLElement => !!el
    );

    this.observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < this.ignoreObserverUntil) return;

        const visible = entries.filter((entry) => entry.isIntersecting);
        if (!visible.length) return;

        const viewportMid = window.innerHeight / 2;
        const closest = visible.reduce((best, entry) => {
          const rect = entry.boundingClientRect;
          const mid = rect.top + rect.height / 2;
          const dist = Math.abs(mid - viewportMid);
          const bestRect = best.boundingClientRect;
          const bestMid = bestRect.top + bestRect.height / 2;
          const bestDist = Math.abs(bestMid - viewportMid);
          return dist < bestDist ? entry : best;
        });

        const id = closest.target.id;
        if (!id) return;

        const nextPath = id === 'inicio' ? '/' : `/${id}`;
        this.syncUrl(nextPath);
      },
      {
        root: null,
        rootMargin: '-20% 0px -20% 0px',
        threshold: [0, 0.15, 0.35, 0.5, 0.65, 0.85, 1],
      }
    );

    for (const el of targets) {
      this.observer.observe(el);
    }
  }

  private syncUrl(path: string) {
    if (path === this.currentPath) return;
    this.currentPath = path;
    this.location.replaceState(path);
  }

  private scrollToPath(path: string, smooth: boolean) {
    if (!isPlatformBrowser(this.platformId)) return;
    const id = path === '/' ? 'inicio' : path.replace(/^\//, '');
    const el = document.getElementById(id);
    if (!el) return;

    this.ignoreObserverUntil = Date.now() + (smooth ? 900 : 400);
    el.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
      block: 'start',
    });
  }

  private normalizePath(url: string): string {
    const path = url.split('?')[0].split('#')[0];
    return path === '' ? '/' : path;
  }
}
