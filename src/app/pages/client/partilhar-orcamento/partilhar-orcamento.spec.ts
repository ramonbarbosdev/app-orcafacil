import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartilharOrcamento } from './partilhar-orcamento';

describe('PartilharOrcamento', () => {
  let component: PartilharOrcamento;
  let fixture: ComponentFixture<PartilharOrcamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartilharOrcamento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartilharOrcamento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
