import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCasts } from './all-casts';

describe('AllCasts', () => {
  let component: AllCasts;
  let fixture: ComponentFixture<AllCasts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllCasts],
    }).compileComponents();

    fixture = TestBed.createComponent(AllCasts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
