import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';



export type EditableGridColumnType =
  | 'text'
  | 'number'
  | 'currency'
  | 'readonly'
  | 'readonly-currency'
  | 'actions';

export interface EditableGridColumn {
  key: string;
  label?: string;
  type: EditableGridColumnType;
  col: string; // ex: '5fr', '120px'
  align?: 'left' | 'center' | 'right';
  editable?: boolean;
}

@Component({
  selector: 'app-editable-grid',
  imports: [InputNumberModule, FormsModule, CommonModule, InputTextModule, ButtonModule, DividerModule],
  templateUrl: './editable-grid.html',
  styleUrl: './editable-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditableGrid {


  @Input({ required: true })
  columns: EditableGridColumn[] = [];

  @Input({ required: true })
  data: any[] = [];

  @Input()
  darkMode = false;

  @Output()
  dataChange = new EventEmitter<any[]>();

  @Output()
  rowAdd = new EventEmitter<void>();

  @Output()
  rowRemove = new EventEmitter<number>();

  @Output()
  valueChange = new EventEmitter<{ row: number; key: string; value: any }>();


  get gridTemplateColumns(): string {
    return this.columns.map(col => col.col).join(' ');
  }

  addRow(): void {
    this.rowAdd.emit();
  }

  removeRow(index: number): void {
    this.rowRemove.emit(index);
  }

  updateValue(index: number, key: string, value: any): void {
    const updated = [...this.data];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };

    this.dataChange.emit(updated);
    this.valueChange.emit({ row: index, key, value });
  }

  trackByIndex(index: number): number {
    return index;
  }

  /* =======================
   * Helpers de layout
   * ======================= */

  getAlignClass(col: EditableGridColumn): string {
    switch (col.align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  }
}
