import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExibirQrcode } from './exibir-qrcode';

describe('ExibirQrcode', () => {
  let component: ExibirQrcode;
  let fixture: ComponentFixture<ExibirQrcode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExibirQrcode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExibirQrcode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
