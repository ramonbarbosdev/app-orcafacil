import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrcamentoInformacaoadicionalForm } from './orcamento-informacaoadicional-form';

describe('OrcamentoInformacaoadicionalForm', () => {
  let component: OrcamentoInformacaoadicionalForm;
  let fixture: ComponentFixture<OrcamentoInformacaoadicionalForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrcamentoInformacaoadicionalForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrcamentoInformacaoadicionalForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
