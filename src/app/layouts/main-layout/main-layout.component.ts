import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  imports: [SidebarComponent, RouterOutlet, CommonModule, MatIconModule],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  sidebarOpen = false;
  userInitials = '';
  userName = '';
  userRole = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private navSub?: Subscription;

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.name || 'Usuario';
      this.userRole = user.role || 'staff';
      this.userInitials = this.buildInitials(this.userName);
    }

    this.navSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.closeSidebar());
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
    document.body.style.overflow = '';
  }

  private buildInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.syncBodyScroll();
  }

  closeSidebar() {
    if (!this.sidebarOpen) return;
    this.sidebarOpen = false;
    this.syncBodyScroll();
  }

  private syncBodyScroll() {
    document.body.style.overflow = this.sidebarOpen ? 'hidden' : '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/auth']);
  }
}
