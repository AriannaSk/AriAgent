import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseDetail } from './house-detail';

describe('HouseDetail', () => {
  let component: HouseDetail;
  let fixture: ComponentFixture<HouseDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HouseDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(HouseDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
