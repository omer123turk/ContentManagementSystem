import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomAlertComponent } from './custom-alert-component';

describe('CustomAlertComponent', () => {
  let component: CustomAlertComponent;
  let fixture: ComponentFixture<CustomAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomAlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomAlertComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
