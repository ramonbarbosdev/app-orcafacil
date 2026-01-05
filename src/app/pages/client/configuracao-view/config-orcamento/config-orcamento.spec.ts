import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigOrcamento } from './config-orcamento';

describe('ConfigOrcamento', () => {
  let component: ConfigOrcamento;
  let fixture: ComponentFixture<ConfigOrcamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigOrcamento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigOrcamento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
