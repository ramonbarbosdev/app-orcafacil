import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Catalogocampoform } from './catalogocampoform';

describe('Catalogocampoform', () => {
  let component: Catalogocampoform;
  let fixture: ComponentFixture<Catalogocampoform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Catalogocampoform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Catalogocampoform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
