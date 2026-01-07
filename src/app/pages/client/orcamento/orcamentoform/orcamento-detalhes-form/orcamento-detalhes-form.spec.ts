import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrcamentoDetalhesForm } from './orcamento-detalhes-form';

describe('OrcamentoDetalhesForm', () => {
  let component: OrcamentoDetalhesForm;
  let fixture: ComponentFixture<OrcamentoDetalhesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrcamentoDetalhesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrcamentoDetalhesForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
