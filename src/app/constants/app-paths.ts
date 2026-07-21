/** Base path for the authenticated clinic app. */
export const ADMIN_BASE = '/admin';

export const AppPaths = {
  landing: '/',
  auth: `${ADMIN_BASE}/auth`,
  dashboard: `${ADMIN_BASE}/dashboard`,
  patients: `${ADMIN_BASE}/pacientes`,
  patientCreate: `${ADMIN_BASE}/pacientes/create`,
  patient: (id: string) => `${ADMIN_BASE}/pacientes/${id}`,
  patientSection: (id: string, section: string) =>
    `${ADMIN_BASE}/pacientes/${id}/${section}`,
  schedule: `${ADMIN_BASE}/schedule`,
  consultation: `${ADMIN_BASE}/consultation`,
  consultationInfo: (id: string) => `${ADMIN_BASE}/consultation-info/${id}`,
  staff: `${ADMIN_BASE}/staff`,
  configuracion: `${ADMIN_BASE}/configuracion`,
  solicitudes: `${ADMIN_BASE}/solicitudes`,
} as const;
