import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Orcamentolist } from './orcamentolist';

describe('Orcamentolist', () => {
  let component: Orcamentolist;
  let fixture: ComponentFixture<Orcamentolist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Orcamentolist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Orcamentolist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
