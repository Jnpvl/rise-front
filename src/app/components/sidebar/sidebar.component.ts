import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  @Input() userInitials: string = '';
  @Input() userName: string = '';
  @Input() userRole: string = '';
  @Input() mobileOpen = false;

  @Output() logoutEvent = new EventEmitter<void>();
  @Output() closeMobile = new EventEmitter<void>();

  requestClose() {
    this.closeMobile.emit();
  }

  logout() {
    this.logoutEvent.emit();
  }
}
