import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutCardConfig } from './layout-card-config';

describe('LayoutCardConfig', () => {
  let component: LayoutCardConfig;
  let fixture: ComponentFixture<LayoutCardConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutCardConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutCardConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
