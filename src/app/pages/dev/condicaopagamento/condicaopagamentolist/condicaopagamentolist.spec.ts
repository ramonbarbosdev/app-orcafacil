import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Condicaopagamentolist } from './condicaopagamentolist';

describe('Condicaopagamentolist', () => {
  let component: Condicaopagamentolist;
  let fixture: ComponentFixture<Condicaopagamentolist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Condicaopagamentolist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Condicaopagamentolist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
