import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
  private readonly sanitizer = inject(DomSanitizer);

  page!: ServicePage;
  firstBlockHtml!: SafeHtml;
  remainingBodyHtml!: SafeHtml;
  readonly whereWhenHtml = seoCopy.donde_cuando_html;
  relatedPages: ServicePage[] = [];

  ngOnInit(): void {
    const slug = `/servicios/${this.route.snapshot.paramMap.get('slug') ?? ''}`;
    this.page = seoCopy.pages.find((candidate) => candidate.slug === slug) ?? seoCopy.pages[0];
    const firstClosingParagraph = this.page.body_html.indexOf('</p>') + '</p>'.length;
    const splitAt = firstClosingParagraph > '</p>'.length ? firstClosingParagraph : this.page.body_html.length;
    this.firstBlockHtml = this.sanitizer.bypassSecurityTrustHtml(this.page.body_html.slice(0, splitAt));
    this.remainingBodyHtml = this.sanitizer.bypassSecurityTrustHtml(this.page.body_html.slice(splitAt));
    this.relatedPages = this.page.related
      .map((key) => seoCopy.pages.find((candidate) => candidate.key === key))
      .filter((candidate): candidate is ServicePage => !!candidate);
  }
}
