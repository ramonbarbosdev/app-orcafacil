import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Condicaopagamentoform } from './condicaopagamentoform';

describe('Condicaopagamentoform', () => {
  let component: Condicaopagamentoform;
  let fixture: ComponentFixture<Condicaopagamentoform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Condicaopagamentoform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Condicaopagamentoform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
