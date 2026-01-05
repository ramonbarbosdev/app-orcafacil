import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigEmpresa } from './config-empresa';

describe('ConfigEmpresa', () => {
  let component: ConfigEmpresa;
  let fixture: ComponentFixture<ConfigEmpresa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigEmpresa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigEmpresa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
