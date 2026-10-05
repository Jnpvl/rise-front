import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HOME_COPY } from '../../data/home-copy';
import { ServiceCardComponent } from '../../components/service-card/service-card.component';
import { seoCopy } from '../../data/servicios-data';

@Component({
  selector: 'app-services-hub',
  standalone: true,
  imports: [CommonModule, ServiceCardComponent],
  templateUrl: './services-hub.component.html',
})
export class ServicesHubComponent {
  readonly cards = HOME_COPY.serviceCards;
  readonly whereWhenHtml = seoCopy.donde_cuando_html;
}
