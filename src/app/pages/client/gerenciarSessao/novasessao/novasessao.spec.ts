import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Novasessao } from './novasessao';

describe('Novasessao', () => {
  let component: Novasessao;
  let fixture: ComponentFixture<Novasessao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Novasessao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Novasessao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
