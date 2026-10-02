import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { seoCopy, ServicePage } from '../data/servicios-data';
import { CLINIC_FACEBOOK, CLINIC_INSTAGRAM } from './clinic-defaults';

const SITE_URL = 'https://serviciosmedicosrise.com';
const OG_IMAGE = `${SITE_URL}/logo-clear.png`;

export interface RouteSeo {
  title: string;
  description: string;
  canonicalPath: string;
  jsonLd?: unknown[];
  noindex?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  updateForPath(path: string): void {
    const cleanPath = path.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
    const service = seoCopy.pages.find((page) => page.slug === cleanPath);
    const routeSeo = cleanPath === '/admin' || cleanPath.startsWith('/admin/')
      ? {
          title: 'Administración | Servicios Médicos RISE',
          description: 'Área privada de administración de Servicios Médicos RISE.',
          canonicalPath: '/',
          noindex: true,
        }
      : service
        ? this.serviceSeo(service)
        : cleanPath === '/servicios'
          ? this.hubSeo()
          : this.homeSeo(cleanPath === '/');

    this.set(routeSeo);
  }

  set(routeSeo: RouteSeo): void {
    this.title.setTitle(routeSeo.title);
    this.updateMeta('description', routeSeo.description);
    this.updateMeta('robots', routeSeo.noindex ? 'noindex, nofollow' : 'index, follow');
    this.updateProperty('og:type', 'website');
    this.updateProperty('og:locale', 'es_MX');
    this.updateProperty('og:site_name', 'Servicios Médicos RISE');
    this.updateProperty('og:title', routeSeo.title);
    this.updateProperty('og:description', routeSeo.description);
    this.updateProperty('og:url', `${SITE_URL}${routeSeo.canonicalPath === '/' ? '/' : routeSeo.canonicalPath}`);
    this.updateProperty('og:image', OG_IMAGE);
    this.updateMeta('twitter:card', 'summary');
    this.updateMeta('twitter:title', routeSeo.title);
    this.updateMeta('twitter:description', routeSeo.description);
    this.updateMeta('twitter:image', OG_IMAGE);
    this.setCanonical(routeSeo.canonicalPath);
    this.setJsonLd(routeSeo.jsonLd ?? []);
  }

  private homeSeo(isHome: boolean): RouteSeo {
    return {
      title: seoCopy.home.title,
      description: seoCopy.home.meta,
      canonicalPath: isHome ? '/' : '/',
      jsonLd: isHome
        ? [{ ...seoCopy.home.jsonld_medicalclinic, sameAs: [CLINIC_FACEBOOK, CLINIC_INSTAGRAM] }]
        : [],
    };
  }

  private hubSeo(): RouteSeo {
    return {
      title: 'Servicios médicos en Hermosillo | Servicios RISE',
      description: 'Consulta general, podología, curaciones, análisis clínicos, antidoping y más en Servicios Médicos RISE, Hermosillo. Escríbenos por WhatsApp.',
      canonicalPath: '/servicios',
      jsonLd: [{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Servicios', item: `${SITE_URL}/servicios` },
        ],
      }],
    };
  }

  private serviceSeo(page: ServicePage): RouteSeo {
    return {
      title: page.title,
      description: page.meta,
      canonicalPath: page.slug,
      jsonLd: [page.jsonld_faqpage, page.jsonld_breadcrumb],
    };
  }

  private updateMeta(name: string, content: string): void {
    this.meta.updateTag({ name, content }, `name='${name}'`);
  }

  private updateProperty(property: string, content: string): void {
    this.meta.updateTag({ property, content }, `property='${property}'`);
  }

  private setCanonical(path: string): void {
    const canonical = `${SITE_URL}${path === '/' ? '/' : path}`;
    const links = Array.from(this.document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]'));
    const link = links[0] ?? this.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', canonical);
    if (!link.parentNode) this.document.head.appendChild(link);
    for (const duplicate of links.slice(1)) duplicate.remove();
  }

  private setJsonLd(values: unknown[]): void {
    this.document.head.querySelectorAll('script[data-rise-jsonld]').forEach((script) => script.remove());
    for (const value of values) {
      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-rise-jsonld', 'true');
      script.textContent = JSON.stringify(value);
      this.document.head.appendChild(script);
    }
  }
}
