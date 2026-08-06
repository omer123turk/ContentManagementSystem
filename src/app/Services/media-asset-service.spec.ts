import { TestBed } from '@angular/core/testing';

import { MediaAssetService } from './media-asset-service';

describe('MediaAssetService', () => {
  let service: MediaAssetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaAssetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
