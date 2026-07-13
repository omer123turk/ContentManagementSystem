import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainContents } from './main-contents';

describe('MainContents', () => {
  let component: MainContents;
  let fixture: ComponentFixture<MainContents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainContents],
    }).compileComponents();

    fixture = TestBed.createComponent(MainContents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
