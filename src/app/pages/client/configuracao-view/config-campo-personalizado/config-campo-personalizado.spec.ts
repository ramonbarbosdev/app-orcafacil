import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigCampoPersonalizado } from './config-campo-personalizado';

describe('ConfigCampoPersonalizado', () => {
  let component: ConfigCampoPersonalizado;
  let fixture: ComponentFixture<ConfigCampoPersonalizado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigCampoPersonalizado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigCampoPersonalizado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
