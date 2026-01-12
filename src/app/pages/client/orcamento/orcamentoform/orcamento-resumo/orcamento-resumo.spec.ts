import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrcamentoResumo } from './orcamento-resumo';

describe('OrcamentoResumo', () => {
  let component: OrcamentoResumo;
  let fixture: ComponentFixture<OrcamentoResumo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrcamentoResumo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrcamentoResumo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
