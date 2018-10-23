import { TestBed, inject } from '@angular/core/testing';

import { SolarResolverService } from './solar-resolver.service';

describe('SolarResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SolarResolverService]
    });
  });

  it('should be created', inject([SolarResolverService], (service: SolarResolverService) => {
    expect(service).toBeTruthy();
  }));
});
