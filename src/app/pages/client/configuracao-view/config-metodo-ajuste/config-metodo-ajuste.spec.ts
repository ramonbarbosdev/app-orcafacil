import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigMetodoAjuste } from './config-metodo-ajuste';

describe('ConfigMetodoAjuste', () => {
  let component: ConfigMetodoAjuste;
  let fixture: ComponentFixture<ConfigMetodoAjuste>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigMetodoAjuste]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigMetodoAjuste);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
