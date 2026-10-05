import { RenderMode, ServerRoute } from '@angular/ssr';

const prerenderedServiceSlugs = [
  'podologia-pie-diabetico',
  'curaciones',
  'analisis-clinicos',
  'antidoping',
  'yesos-puntos',
  'consulta-medicina-general',
];

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'servicios', renderMode: RenderMode.Prerender },
  {
    path: 'servicios/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return prerenderedServiceSlugs.map((slug) => ({ slug }));
    },
  },
  { path: 'experiencia', renderMode: RenderMode.Client },
  { path: 'agenda', renderMode: RenderMode.Client },
  { path: 'contacto', renderMode: RenderMode.Client },
  { path: 'aviso-de-privacidad', renderMode: RenderMode.Prerender },
  { path: 'terminos', renderMode: RenderMode.Prerender },
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Client },
];
