import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Servicolist } from './servicolist';

describe('Servicolist', () => {
  let component: Servicolist;
  let fixture: ComponentFixture<Servicolist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Servicolist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Servicolist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
