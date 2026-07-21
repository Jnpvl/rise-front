import { Component, OnInit } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auth',
  imports: [MatIconModule, FormsModule, CommonModule],
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {

  email: string = '';
  password: string = '';
  emailError: string = '';
  passwordError: string = '';
  isEmailValid: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;
  currentYear = new Date().getFullYear();

  constructor(
    private authService: AuthService,
    private router: Router
  ){}

  ngOnInit(): void {
  }

  validateEmail(): void {
    if (!this.email) {
      this.emailError = '';
      this.isEmailValid = false;
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.emailError = 'Por favor ingresa un email válido';
      this.isEmailValid = false;
    } else {
      this.emailError = '';
      this.isEmailValid = true;
    }
  }

  validateForm(): void {
    this.validateEmail();
    
    if (!this.password) {
      this.passwordError = '';
    } else if (this.password.trim() === '') {
      this.passwordError = 'La contraseña es requerida';
    } else {
      this.passwordError = '';
    }
  }

  async login() {
    if (!this.isFormValid()) {
      // Mostrar alerta de validación
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor completa todos los campos obligatorios correctamente.',
        confirmButtonColor: '#F59E0B',
      });
      return;
    }

    this.isLoading = true;

    const credentials = {
      email: this.email,
      password: this.password
    };

    try {
      const response = await this.authService.login(credentials);

      localStorage.setItem('user', JSON.stringify(response.user)); 
      
      // Mostrar alerta de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Has iniciado sesión correctamente',
        confirmButtonColor: '#E540AE',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Limpiar el formulario
      this.clearForm();
      
      // Navegar al dashboard después del login exitoso
      this.router.navigate(['/admin/dashboard']);

    } catch (error: any) {
      console.error('Error al iniciar sesión', error);
      
      // Mostrar alerta de error
      Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: error?.error?.message || 'Credenciales incorrectas. Por favor verifica tu email y contraseña.',
        confirmButtonColor: '#DC2626',
      });
    } finally {
      this.isLoading = false;
    }
  }

  isFormValid(): boolean {
    return this.email.trim() !== '' && this.password.trim() !== '' && this.isEmailValid;
  }

  clearForm(): void {
    this.email = '';
    this.password = '';
    this.emailError = '';
    this.passwordError = '';
    this.isEmailValid = false;
    this.showPassword = false;
  }
}
