import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiclientService } from './apiclient.service';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const token = localStorage.getItem('token');
    return token && !this.isTokenExpired(token) ? token : null;
  }

  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private apiClient :  ApiclientService
  ) { }

  public async login(credentials: { email: string, password: string }): Promise<any> {
    const response = await this.apiClient.post<any>('staff/login', credentials, environment.apiUrl);
  
    if (isPlatformBrowser(this.platformId)) localStorage.setItem('token', response.token);
  
    return response;
  }
  
  isTokenExpired(token: string): boolean {
    try {
      const { exp } = jwtDecode<{ exp: number }>(token);
      return exp < Math.floor(Date.now() / 1000);
    } catch {
      return true;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUser(): any | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  
  logout(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }


}
