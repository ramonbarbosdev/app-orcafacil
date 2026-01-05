import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Metodoprecificacaoform } from './metodoprecificacaoform';

describe('Metodoprecificacaoform', () => {
  let component: Metodoprecificacaoform;
  let fixture: ComponentFixture<Metodoprecificacaoform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Metodoprecificacaoform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Metodoprecificacaoform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
