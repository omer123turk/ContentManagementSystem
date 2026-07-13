import { TestBed } from '@angular/core/testing';

import { MovieCastService } from './movie-cast.service';

describe('MovieCastService', () => {
  let service: MovieCastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovieCastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
