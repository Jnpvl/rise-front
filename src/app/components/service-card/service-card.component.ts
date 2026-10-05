import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
export type ServiceCardCopy = { titulo: string; linea: string; enlace: string };

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './service-card.component.html',
})
export class ServiceCardComponent {
  @Input({ required: true }) card!: ServiceCardCopy;
  @Input() number = '';
  @Input() imagen?: string;
}
