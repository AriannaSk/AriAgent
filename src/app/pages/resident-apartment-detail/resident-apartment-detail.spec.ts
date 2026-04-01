import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidentApartmentDetail } from './resident-apartment-detail';

describe('ResidentApartmentDetail', () => {
  let component: ResidentApartmentDetail;
  let fixture: ComponentFixture<ResidentApartmentDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentApartmentDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ResidentApartmentDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
