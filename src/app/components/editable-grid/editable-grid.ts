import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { LayoutService } from '../../layout/service/layout.service';

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
  col: string;
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-editable-grid',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    DividerModule,
  ],
  templateUrl: './editable-grid.html',
  styleUrl: './editable-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditableGrid<T extends Record<string, any>> {

  /* =======================
   * Inputs
   * ======================= */

  @Input({ required: true })
  columns!: EditableGridColumn[];

  /** Factory responsável por criar uma nova linha */
  @Input({ required: true })
  createRow!: (index?: number) => T;

  /** Valor inicial opcional */
  @Input()
  set initialData(value: T[]) {
    this._rows.set(Array.isArray(value) ? [...value] : []);
  }

  /* =======================
   * Outputs
   * ======================= */

  @Output()
  dataChange = new EventEmitter<T[]>();

  /* =======================
   * State
   * ======================= */

  private _rows = signal<T[]>([]);

  rows = computed(() => this._rows());

  layoutService = inject(LayoutService);

  /* =======================
   * Layout
   * ======================= */

  get gridTemplateColumns(): string {
    return this.columns.map(c => c.col).join(' ');
  }

  /* =======================
   * Actions
   * ======================= */

  addRow(): void {
    const newRow = this.createRow(this._rows().length);
    const updated = [...this._rows(), newRow];

    this._rows.set(updated);
    this.emit();
  }

  removeRow(index: number): void {
    const updated = this._rows().filter((_, i) => i !== index);
    this._rows.set(updated);
    this.emit();
  }

  updateValue(row: number, key: string, value: any): void {
    const updated = [...this._rows()];

    updated[row] = {
      ...updated[row],
      [key]: value,
    };

    this._rows.set(updated);
    this.emit();
  }

  private emit(): void {
    this.dataChange.emit(this._rows());
  }

  trackByIndex = (i: number) => i;

  getAlignClass(col: EditableGridColumn): string {
    return col.align === 'center'
      ? 'text-center'
      : col.align === 'right'
      ? 'text-right'
      : 'text-left';
  }
}
