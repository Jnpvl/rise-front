import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PatientsService } from '../../services/patients.service';
import { StaffService } from '../../services/staff.service';
import { Patient } from '../../interfaces/patients.interface';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-patients',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './patients.component.html',
})
export class PatientsComponent implements OnInit {
  patientsList: Patient[] = [];
  staffList: { id: string; name: string }[] = [];
  total: number = 0;
  page: number = 1;
  limit: number = 10;
  searchTerm: string = '';
  activeFilter: 'true' | 'false' | 'all' = 'all';
  creatorFilter: string = '';
  isLoading: boolean = false;
  Math = Math;

  private patientsService = inject(PatientsService);
  private staffService = inject(StaffService);
  private searchSubject = new Subject<string>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadStaff();
    this.loadPatients();

    this.searchSubject.pipe(debounceTime(300)).subscribe((value: string) => {
      this.searchTerm = value;
      this.page = 1;
      this.loadPatients();
    });
  }

  async loadStaff(): Promise<void> {
    try {
      const staff = await this.staffService.getAllStaff();
      this.staffList = (staff || [])
        .filter((s: any) => s.isActive !== false)
        .map((s: any) => ({ id: s.id, name: s.name }));
    } catch (error) {
      console.error('Error cargando staff:', error);
      this.staffList = [];
    }
  }

  onSearchInputChange(value: string): void {
    this.searchSubject.next(value);
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadPatients();
  }

  async loadPatients(): Promise<void> {
    this.isLoading = true;
    try {
      const res = await this.patientsService.getPatients(
        this.page,
        this.limit,
        this.activeFilter,
        this.searchTerm,
        this.creatorFilter
      );

      this.patientsList = res.patients;
      this.total = res.total;
    } catch (error) {
      console.error('Error cargando pacientes:', error);
    } finally {
      this.isLoading = false;
    }
  }

  changePage(next: boolean): void {
    const maxPage = Math.ceil(this.total / this.limit);
    if (next && this.page < maxPage) {
      this.page++;
      this.loadPatients();
    } else if (!next && this.page > 1) {
      this.page--;
      this.loadPatients();
    }
  }

  viewPatientDetails(patientId: string): void {
    this.router.navigate(['/admin/pacientes', patientId]);
  }

  addNewPatient(): void {
    this.router.navigate(['/admin/pacientes/create']);
  }

  getAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }
}
