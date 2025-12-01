import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Clienteform } from './clienteform';

describe('Clienteform', () => {
  let component: Clienteform;
  let fixture: ComponentFixture<Clienteform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clienteform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Clienteform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
