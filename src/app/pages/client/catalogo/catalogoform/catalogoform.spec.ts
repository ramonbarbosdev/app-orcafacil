import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Catalogoform } from './catalogoform';

describe('Catalogoform', () => {
  let component: Catalogoform;
  let fixture: ComponentFixture<Catalogoform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Catalogoform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Catalogoform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
