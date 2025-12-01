import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Servicoform } from './servicoform';

describe('Servicoform', () => {
  let component: Servicoform;
  let fixture: ComponentFixture<Servicoform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Servicoform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Servicoform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
