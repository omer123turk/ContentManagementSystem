import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContentComponent } from './add-content-component';

describe('AddContentComponent', () => {
  let component: AddContentComponent;
  let fixture: ComponentFixture<AddContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddContentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
