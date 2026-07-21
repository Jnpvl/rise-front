import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientConsultationsComponent } from './patient-consultations.component';

describe('PatientConsultationsComponent', () => {
  let component: PatientConsultationsComponent;
  let fixture: ComponentFixture<PatientConsultationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientConsultationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PatientConsultationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 