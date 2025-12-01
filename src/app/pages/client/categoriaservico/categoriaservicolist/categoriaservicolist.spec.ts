import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Categoriaservicolist } from './categoriaservicolist';

describe('Categoriaservicolist', () => {
  let component: Categoriaservicolist;
  let fixture: ComponentFixture<Categoriaservicolist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Categoriaservicolist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Categoriaservicolist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
