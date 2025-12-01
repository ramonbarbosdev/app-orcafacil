import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Categoriaservicoform } from './categoriaservicoform';

describe('Categoriaservicoform', () => {
  let component: Categoriaservicoform;
  let fixture: ComponentFixture<Categoriaservicoform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Categoriaservicoform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Categoriaservicoform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
