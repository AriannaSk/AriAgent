import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllHouses } from './all-houses';

describe('AllHouses', () => {
  let component: AllHouses;
  let fixture: ComponentFixture<AllHouses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllHouses],
    }).compileComponents();

    fixture = TestBed.createComponent(AllHouses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
