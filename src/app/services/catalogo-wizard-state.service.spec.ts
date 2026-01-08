import { TestBed } from '@angular/core/testing';

import { CatalogoWizardStateService } from './catalogo-wizard-state.service';

describe('CatalogoWizardStateService', () => {
  let service: CatalogoWizardStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatalogoWizardStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
