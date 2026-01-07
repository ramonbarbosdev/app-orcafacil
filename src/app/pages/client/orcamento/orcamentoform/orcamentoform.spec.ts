import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Orcamentoform } from './orcamentoform';

describe('Orcamentoform', () => {
  let component: Orcamentoform;
  let fixture: ComponentFixture<Orcamentoform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Orcamentoform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Orcamentoform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
