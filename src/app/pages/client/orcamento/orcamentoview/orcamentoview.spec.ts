import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Orcamentoview } from './orcamentoview';

describe('Orcamentoview', () => {
  let component: Orcamentoview;
  let fixture: ComponentFixture<Orcamentoview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Orcamentoview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Orcamentoview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
