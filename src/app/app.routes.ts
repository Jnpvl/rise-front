import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';

const loadLanding = () =>
  import('./pages/landing/landing.component').then((m) => m.LandingComponent);

export const routes: Routes = [
  {
    path: '',
    loadComponent: loadLanding,
  },
  {
    path: 'servicios',
    loadComponent: loadLanding,
  },
  {
    path: 'experiencia',
    loadComponent: loadLanding,
  },
  {
    path: 'agenda',
    loadComponent: loadLanding,
  },
  {
    path: 'contacto',
    loadComponent: loadLanding,
  },
  {
    path: 'admin',
    children: [
      {
        path: 'auth',
        loadComponent: () =>
          import('./pages/auth/auth.component').then((m) => m.AuthComponent),
        canActivate: [NoAuthGuard],
      },
      {
        path: '',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./layouts/main-layout/main-layout.component').then(
            (m) => m.MainLayoutComponent
          ),
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
          },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./pages/dashboard/dashboard.component').then(
                (m) => m.DashboardComponent
              ),
          },
          {
            path: 'pacientes',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./pages/Patient-Module/patients.component').then(
                    (m) => m.PatientsComponent
                  ),
              },
              {
                path: 'create',
                loadComponent: () =>
                  import(
                    './pages/Patient-Module/patient-create/patient-create.component'
                  ).then((m) => m.PatientCreateComponent),
              },
              {
                path: ':id',
                loadComponent: () =>
                  import(
                    './layouts/patient-details-layout/patient-details-layout.component'
                  ).then((m) => m.PatientDetailsLayoutComponent),
                children: [
                  {
                    path: '',
                    redirectTo: 'informacion',
                    pathMatch: 'full',
                  },
                  {
                    path: 'informacion',
                    loadComponent: () =>
                      import(
                        './pages/Patient-Module/patient-info/patient-info.component'
                      ).then((m) => m.PatientInfoComponent),
                  },
                  {
                    path: 'consultas',
                    loadComponent: () =>
                      import(
                        './pages/Patient-Module/patient-consultations/patient-consultations.component'
                      ).then((m) => m.PatientConsultationsComponent),
                  },
                  {
                    path: 'adjuntos',
                    loadComponent: () =>
                      import(
                        './pages/Patient-Module/patient-attachments/patient-attachments.component'
                      ).then((m) => m.PatientAttachmentsComponent),
                  },
                ],
              },
            ],
          },
          {
            path: 'schedule',
            loadComponent: () =>
              import('./layouts/schedule-layout/schedule-layout.component').then(
                (m) => m.ScheduleLayoutComponent
              ),
            children: [
              {
                path: '',
                redirectTo: 'calendar',
                pathMatch: 'full',
              },
              {
                path: 'calendar',
                loadComponent: () =>
                  import(
                    './pages/Schedule-Module/calendar/calendar.component'
                  ).then((m) => m.CalendarComponent),
              },
            ],
          },
          {
            path: 'consultation',
            loadComponent: () =>
              import(
                './pages/Consultation-Module/consultation/consultation.component'
              ).then((m) => m.ConsultationComponent),
          },
          {
            path: 'consultation-info/:id',
            loadComponent: () =>
              import(
                './pages/Consultation-Module/consultation-info/consultation-info.component'
              ).then((m) => m.ConsultationInfoComponent),
          },
          {
            path: 'laboratorios',
            loadComponent: () =>
              import('./pages/Lab-Module/lab-capture.component').then(
                (m) => m.LabCaptureComponent
              ),
          },
          {
            path: 'staff',
            loadComponent: () =>
              import('./pages/Staff-Module/staff.component').then(
                (m) => m.StaffComponent
              ),
          },
          {
            path: 'configuracion',
            loadComponent: () =>
              import(
                './pages/Configuration-Module/clinic-settings/clinic-settings.component'
              ).then((m) => m.ClinicSettingsComponent),
          },
          {
            path: 'solicitudes',
            loadComponent: () =>
              import(
                './pages/Web-Inquiries-Module/web-inquiries.component'
              ).then((m) => m.WebInquiriesComponent),
          },
          {
            path: '**',
            redirectTo: 'dashboard',
          },
        ],
      },
    ],
  },
  // Compatibilidad con URLs anteriores
  { path: 'auth', redirectTo: 'admin/auth', pathMatch: 'full' },
  { path: 'dashboard', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  { path: 'pacientes', redirectTo: 'admin/pacientes' },
  { path: 'schedule', redirectTo: 'admin/schedule' },
  { path: 'consultation', redirectTo: 'admin/consultation' },
  { path: 'staff', redirectTo: 'admin/staff' },
  { path: '**', redirectTo: '' },
];
