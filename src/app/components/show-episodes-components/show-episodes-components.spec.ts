import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowEpisodesComponents } from './show-episodes-components';

describe('ShowEpisodesComponents', () => {
  let component: ShowEpisodesComponents;
  let fixture: ComponentFixture<ShowEpisodesComponents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowEpisodesComponents],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowEpisodesComponents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
