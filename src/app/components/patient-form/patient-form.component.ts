import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Patient } from '../../interfaces/patients.interface';

@Component({
  selector: 'app-patient-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-form.component.html',
})
export class PatientFormComponent implements OnInit {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() patientData: Partial<Patient> = {};
  @Input() showBackButton: boolean = true;

  @Output() formSubmitted = new EventEmitter<Partial<Patient>>();
  @Output() formCancelled = new EventEmitter<void>();
  @Output() goBackClicked = new EventEmitter<void>();

  form: Partial<Patient> = {
    firstName: '',
    lastName: '',
    gender: '',
    birthDate: '',
    phone: '',
    address: '',
    occupation: '',
    educationLevel: '',
    bloodType: '',
    weight: '',
    height: '',
    shoeSize: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactAddress: '',
    email: '',
    curp: '',
    maritalStatus: '',
    guardianName: '',
    allergies: '',
    medicalConditions: '',
    currentMedications: '',
    initialNotes: '',
    patologicos: '',
    noPatologicos: '',
    isActive: true,
  };

  isLoading = false;

  ngOnInit() {
    if (this.patientData && Object.keys(this.patientData).length > 0) {
      this.form = { ...this.form, ...this.patientData };
    }
  }

  submit(formRef: NgForm) {
    if (formRef.invalid || this.isLoading) return;
    this.isLoading = true;
    this.formSubmitted.emit(this.form);
  }

  reset() {
    this.form = {
      firstName: '',
      lastName: '',
      gender: '',
      birthDate: '',
      phone: '',
      address: '',
      occupation: '',
      educationLevel: '',
      bloodType: '',
      weight: '',
      height: '',
      shoeSize: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactAddress: '',
      email: '',
      curp: '',
      maritalStatus: '',
      guardianName: '',
      allergies: '',
      medicalConditions: '',
      currentMedications: '',
      initialNotes: '',
      patologicos: '',
      noPatologicos: '',
      isActive: true,
    };
  }

  cancel() {
    this.formCancelled.emit();
  }

  goBack() {
    this.goBackClicked.emit();
  }
}
