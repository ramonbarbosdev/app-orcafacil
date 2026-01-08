import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Catalogolist } from './catalogolist';

describe('Catalogolist', () => {
  let component: Catalogolist;
  let fixture: ComponentFixture<Catalogolist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Catalogolist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Catalogolist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
