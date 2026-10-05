import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { seoCopy, ServicePage } from '../../data/servicios-data';

@Component({
  selector: 'app-servicio-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './servicio-page.component.html',
})
export class ServicioPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  page!: ServicePage;
  readonly whereWhenHtml = seoCopy.donde_cuando_html;
  relatedPages: ServicePage[] = [];

  ngOnInit(): void {
    const slug = `/servicios/${this.route.snapshot.paramMap.get('slug') ?? ''}`;
    this.page = seoCopy.pages.find((candidate) => candidate.slug === slug) ?? seoCopy.pages[0];
    this.relatedPages = this.page.related
      .map((key) => seoCopy.pages.find((candidate) => candidate.key === key))
      .filter((candidate): candidate is ServicePage => !!candidate);
  }
}
