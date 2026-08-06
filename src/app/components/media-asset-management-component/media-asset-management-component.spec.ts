import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaAssetManagementComponent } from './media-asset-management-component';

describe('MediaAssetManagementComponent', () => {
  let component: MediaAssetManagementComponent;
  let fixture: ComponentFixture<MediaAssetManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaAssetManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaAssetManagementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
