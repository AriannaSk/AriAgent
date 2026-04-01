import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApartmentDetail } from './apartment-detail';

describe('ApartmentDetail', () => {
  let component: ApartmentDetail;
  let fixture: ComponentFixture<ApartmentDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApartmentDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ApartmentDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
