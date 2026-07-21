import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDetailsLayoutComponent } from './patient-details-layout.component';

describe('PatientDetailsLayoutComponent', () => {
  let component: PatientDetailsLayoutComponent;
  let fixture: ComponentFixture<PatientDetailsLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDetailsLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PatientDetailsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 