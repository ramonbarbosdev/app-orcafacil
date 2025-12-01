import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sessaolist } from './sessaolist';

describe('Sessaolist', () => {
  let component: Sessaolist;
  let fixture: ComponentFixture<Sessaolist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sessaolist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sessaolist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
