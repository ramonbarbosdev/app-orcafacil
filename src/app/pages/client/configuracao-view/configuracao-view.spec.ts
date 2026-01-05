import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracaoView } from './configuracao-view';

describe('ConfiguracaoView', () => {
  let component: ConfiguracaoView;
  let fixture: ComponentFixture<ConfiguracaoView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracaoView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfiguracaoView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
