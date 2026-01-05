import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigNotificacao } from './config-notificacao';

describe('ConfigNotificacao', () => {
  let component: ConfigNotificacao;
  let fixture: ComponentFixture<ConfigNotificacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigNotificacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigNotificacao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
