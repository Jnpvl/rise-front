import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-schedule-layout',
  imports: [CommonModule, RouterOutlet, RouterModule, MatIconModule],
  templateUrl: './schedule-layout.component.html',
})
export class ScheduleLayoutComponent {

}
