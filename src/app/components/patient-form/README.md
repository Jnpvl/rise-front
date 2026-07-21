# Patient Form Component

Este es un componente reutilizable para formularios de pacientes que puede ser usado tanto para crear como para editar pacientes.

## Características

- ✅ Modo creación y edición
- ✅ Validación de formularios
- ✅ Campos requeridos y opcionales
- ✅ Diseño responsive
- ✅ Estados de carga
- ✅ Botón de volver opcional

## Uso

### Importar el componente

```typescript
import { PatientFormComponent } from '../../../components/patient-form/patient-form.component';

@Component({
  imports: [PatientFormComponent],
  // ...
})
```

### Uso básico para creación

```html
<app-patient-form
  mode="create"
  [showBackButton]="true"
  (formSubmitted)="onFormSubmitted($event)"
  (formCancelled)="onFormCancelled()"
  (goBackClicked)="onGoBack()"
></app-patient-form>
```

### Uso para edición

```html
<app-patient-form
  mode="edit"
  [patientData]="patientData"
  [showBackButton]="false"
  (formSubmitted)="onFormSubmitted($event)"
  (formCancelled)="onFormCancelled()"
  (goBackClicked)="onGoBack()"
></app-patient-form>
```

## Inputs

| Propiedad | Tipo | Descripción | Default |
|-----------|------|-------------|---------|
| `mode` | `'create' \| 'edit'` | Modo del formulario | `'create'` |
| `patientData` | `Partial<Patient>` | Datos del paciente para edición | `{}` |
| `showBackButton` | `boolean` | Mostrar botón de volver | `true` |

## Outputs

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `formSubmitted` | `EventEmitter<Partial<Patient>>` | Emitido cuando se envía el formulario |
| `formCancelled` | `EventEmitter<void>` | Emitido cuando se cancela el formulario |
| `goBackClicked` | `EventEmitter<void>` | Emitido cuando se hace clic en volver |

## Campos del formulario

### Datos personales
- **Nombre** (requerido)
- **Apellido** (requerido)
- **Género** (requerido)
- **Fecha de nacimiento** (requerido)
- **Estado civil** (opcional)
- **Responsable** (opcional)

### Contacto
- **Teléfono** (requerido)
- **Email** (opcional)
- **Dirección** (requerido)

### Profesionales
- **Ocupación** (requerido)
- **Nivel educativo** (requerido)
- **CURP** (opcional)
- **Tipo de sangre** (requerido)

### Información médica
- **Alergias** (opcional)
- **Condiciones médicas** (opcional)
- **Medicamentos actuales** (opcional)
- **Notas iniciales** (opcional)

## Ejemplo de implementación

### Componente padre (creación)

```typescript
export class PatientCreateComponent {
  async onFormSubmitted(patientData: Partial<Patient>): Promise<void> {
    try {
      const response = await this.patientsService.createPatient(patientData);
      // Manejar éxito
    } catch (error) {
      // Manejar error
    }
  }

  onFormCancelled(): void {
    this.router.navigate(['/pacientes']);
  }

  onGoBack(): void {
    this.router.navigate(['/pacientes']);
  }
}
```

### Componente padre (edición)

```typescript
export class PatientEditComponent {
  patientData: Partial<Patient> = {};
  isEditing = false;

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  async onFormSubmitted(updatedPatientData: Partial<Patient>): Promise<void> {
    try {
      await this.patientsService.updatePatient(this.patientId, updatedPatientData);
      this.isEditing = false;
      // Manejar éxito
    } catch (error) {
      // Manejar error
    }
  }

  onFormCancelled(): void {
    this.isEditing = false;
  }
}
```

## Estilos

El componente usa Tailwind CSS y es completamente responsive. Los estilos están incluidos en el template del componente.

## Validación

El formulario incluye validación para campos requeridos:
- Nombre
- Apellido
- Género
- Fecha de nacimiento
- Teléfono
- Dirección
- Ocupación
- Nivel educativo
- Tipo de sangre

Los mensajes de error se muestran cuando un campo requerido está vacío y ha sido tocado por el usuario. 