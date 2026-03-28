import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Materiallist } from './materiallist';

describe('Materiallist', () => {
  let component: Materiallist;
  let fixture: ComponentFixture<Materiallist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Materiallist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Materiallist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
