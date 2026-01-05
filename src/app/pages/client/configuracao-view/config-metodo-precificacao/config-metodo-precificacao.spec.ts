import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigMetodoPrecificacao } from './config-metodo-precificacao';

describe('ConfigMetodoPrecificacao', () => {
  let component: ConfigMetodoPrecificacao;
  let fixture: ComponentFixture<ConfigMetodoPrecificacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigMetodoPrecificacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigMetodoPrecificacao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
