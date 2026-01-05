import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Metodoprecificacaolist } from './metodoprecificacaolist';

describe('Metodoprecificacaolist', () => {
  let component: Metodoprecificacaolist;
  let fixture: ComponentFixture<Metodoprecificacaolist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Metodoprecificacaolist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Metodoprecificacaolist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
