import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Materialform } from './materialform';

describe('Materialform', () => {
  let component: Materialform;
  let fixture: ComponentFixture<Materialform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Materialform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Materialform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
