import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Catalogocamposimulacaoform } from './catalogocamposimulacaoform';

describe('Catalogocamposimulacaoform', () => {
  let component: Catalogocamposimulacaoform;
  let fixture: ComponentFixture<Catalogocamposimulacaoform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Catalogocamposimulacaoform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Catalogocamposimulacaoform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
