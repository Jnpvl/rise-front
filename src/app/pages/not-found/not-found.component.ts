import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 class="font-display text-4xl font-bold mb-4">Página no encontrada</h1>
      <p class="text-muted mb-6">La dirección que buscas no existe.</p>
      <a routerLink="/" href="/" class="btn-brand">Volver al inicio</a>
    </main>
  `,
})
export class NotFoundComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.set({
      title: 'Página no encontrada | Servicios Médicos RISE',
      description: 'La página que buscas no existe.',
      canonicalPath: '/',
      noindex: true,
    });
  }
}
