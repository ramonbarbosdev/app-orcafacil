import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Catalogocampoajusteform } from './catalogocampoajusteform';

describe('Catalogocampoajusteform', () => {
  let component: Catalogocampoajusteform;
  let fixture: ComponentFixture<Catalogocampoajusteform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Catalogocampoajusteform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Catalogocampoajusteform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
