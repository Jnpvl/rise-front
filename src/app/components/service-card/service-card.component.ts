import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeServiceCard } from '../../data/home-copy';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './service-card.component.html',
})
export class ServiceCardComponent {
  @Input({ required: true }) card!: HomeServiceCard;
  @Input() number = '';
  @Input() imagen?: string;
}
