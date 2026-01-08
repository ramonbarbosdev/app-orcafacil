import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrcamentoItemForm } from './orcamento-item-form';

describe('OrcamentoItemForm', () => {
  let component: OrcamentoItemForm;
  let fixture: ComponentFixture<OrcamentoItemForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrcamentoItemForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrcamentoItemForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
