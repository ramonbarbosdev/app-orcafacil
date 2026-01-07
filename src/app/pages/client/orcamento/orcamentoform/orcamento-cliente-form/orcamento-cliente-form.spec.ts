import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrcamentoClienteForm } from './orcamento-cliente-form';

describe('OrcamentoClienteForm', () => {
  let component: OrcamentoClienteForm;
  let fixture: ComponentFixture<OrcamentoClienteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrcamentoClienteForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrcamentoClienteForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
