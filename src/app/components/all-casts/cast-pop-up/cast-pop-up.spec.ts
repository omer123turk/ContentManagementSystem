import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CastPopUp } from './cast-pop-up';

describe('CastPopUp', () => {
  let component: CastPopUp;
  let fixture: ComponentFixture<CastPopUp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CastPopUp],
    }).compileComponents();

    fixture = TestBed.createComponent(CastPopUp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
