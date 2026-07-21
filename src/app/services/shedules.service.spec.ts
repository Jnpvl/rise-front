import { TestBed } from '@angular/core/testing';

import { ShedulesService } from './shedules.service';

describe('ShedulesService', () => {
  let service: ShedulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShedulesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
