import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { seoCopy } from '../../data/servicios-data';

@Component({
  selector: 'app-services-hub',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './services-hub.component.html',
})
export class ServicesHubComponent {
  readonly pages = seoCopy.pages;
  readonly whereWhenHtml = seoCopy.donde_cuando_html;

  summary(bodyHtml: string): string {
    const firstParagraph = bodyHtml.match(/<p>([\s\S]*?)<\/p>/i)?.[1] ?? bodyHtml;
    return firstParagraph.replace(/<[^>]+>/g, '').trim();
  }
}
