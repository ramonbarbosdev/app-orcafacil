import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrcamentoItemAjusteForm } from './orcamento-item-ajuste-form';

describe('OrcamentoItemAjusteForm', () => {
  let component: OrcamentoItemAjusteForm;
  let fixture: ComponentFixture<OrcamentoItemAjusteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrcamentoItemAjusteForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrcamentoItemAjusteForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
