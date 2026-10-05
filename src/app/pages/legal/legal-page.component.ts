import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LEGAL_PAGES, LegalPage } from '../../data/legal-pages';

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './legal-page.component.html',
})
export class LegalPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);

  page!: LegalPage;
  safeBodyHtml!: SafeHtml;
  readonly legalPages = LEGAL_PAGES;

  ngOnInit(): void {
    const key = this.route.snapshot.data['legalKey'] as LegalPage['key'];
    this.page = LEGAL_PAGES.find((candidate) => candidate.key === key) ?? LEGAL_PAGES[0];
    this.safeBodyHtml = this.sanitizer.bypassSecurityTrustHtml(this.page.bodyHtml);
  }
}
