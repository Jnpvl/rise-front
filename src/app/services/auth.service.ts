import { Injectable } from '@angular/core';
import { ApiclientService } from './apiclient.service';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  getToken(): string | null {
    const token = localStorage.getItem('token');
    return token && !this.isTokenExpired(token) ? token : null;
  }

  constructor(
    private apiClient :  ApiclientService
  ) { }

  public async login(credentials: { email: string, password: string }): Promise<any> {
    const response = await this.apiClient.post<any>('staff/login', credentials, environment.apiUrl);
  
    localStorage.setItem('token', response.token);
  
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
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }


}
