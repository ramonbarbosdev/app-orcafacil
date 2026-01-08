import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableGrid } from './editable-grid';

describe('EditableGrid', () => {
  let component: EditableGrid;
  let fixture: ComponentFixture<EditableGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditableGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditableGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
