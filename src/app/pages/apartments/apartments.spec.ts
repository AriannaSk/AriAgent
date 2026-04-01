import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Apartments } from './apartments';

describe('Apartments', () => {
  let component: Apartments;
  let fixture: ComponentFixture<Apartments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Apartments],
    }).compileComponents();

    fixture = TestBed.createComponent(Apartments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
});
