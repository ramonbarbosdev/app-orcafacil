import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Clientelist } from './clientelist';

describe('Clientelist', () => {
  let component: Clientelist;
  let fixture: ComponentFixture<Clientelist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clientelist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Clientelist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
