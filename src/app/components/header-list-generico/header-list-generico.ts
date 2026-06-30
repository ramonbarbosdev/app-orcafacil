import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from 'primeng/api';
import { BaseService } from '../../services/base.service';
import { AuthService } from '../../auth/auth.service';

export interface ColumnConfig {
  field: string;
  header: string;
  filterPlaceholder?: string;
  minWidth?: string;
  filterType?: 'text' | 'date' | 'numeric' | 'boolean';
  formatter?: (value: any, row?: any) => string;
}

export interface ActionConfig {
  icon: string;
  label?: string;
  severity?: ButtonSeverity;
  rounded?: boolean;
  outlined?: boolean;
  onClick: (row: any) => void;
  requiresConfirmation?: boolean;
  permission?: string;
  disabled?: (row: any) => boolean;
  loading?: (row: any) => boolean;
}

@Component({
  selector: 'app-header-list-generico',
  imports: [
    TableModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './header-list-generico.html',
  styleUrl: './header-list-generico.scss',
})
export class HeaderListGenerico {
  @Input() title = '';
  @Input() value: any[] = [];
  @Input() columns: ColumnConfig[] = [];
  @Input() actions: ActionConfig[] = [];
  @Input() loading = false;
  @Input() endpoint = '';
  @Input() createPermission = '';

  @Output() add = new EventEmitter<void>();
  @Output() clearFilters = new EventEmitter<void>();

  globalFilterFields: string[] = [];
  totalRegistro = 0;

  private confirmationService = inject(ConfirmationService);
  private baseService = inject(BaseService);
  private auth = inject(AuthService);
  private cd = inject(ChangeDetectorRef);

  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('dt') tabela!: Table;

  get canCreate(): boolean {
    if (!this.createPermission) return true;
    return this.auth.hasPermission(this.createPermission);
  }

  get visibleActions(): ActionConfig[] {
    return this.actions.filter((a) => !a.permission || this.auth.hasPermission(a.permission));
  }

  ngOnInit() {
    this.globalFilterFields = this.columns.map((c) => c.field);
  }

  ngAfterViewInit() {
    this.carregarDados();
  }

  onGlobalFilter(table: any, event: any) {
    table.filterGlobal(event.target.value, 'contains');
  }

  onAdd() {
    this.add.emit();
  }

  onClearFilters(table: Table) {
    table.clear();
    if (this.filter) {
      this.filter.nativeElement.value = '';
    }
  }

  get listaFiltrada(): any[] {
    return this.tabela?.filteredValue ?? this.value;
  }

  executarAcao(row: any, acao: ActionConfig) {
    if (acao.disabled?.(row) || acao.loading?.(row)) {
      return;
    }

    const isEditAction =
      acao.label?.toLowerCase().includes('editar') ||
      acao.icon === 'pi pi-pencil';

    const precisaConfirmar =
      !isEditAction && (acao.requiresConfirmation ?? true);

    if (precisaConfirmar) {
      this.confirmationService.confirm({
        message: 'Tem certeza de que deseja continuar?',
        header: 'Confirmação',
        icon: 'pi pi-exclamation-triangle',
        accept: () => acao.onClick(row),
        reject: () => {},
      });
    } else {
      acao.onClick(row);
    }
  }

  carregarLazy(_event?: unknown) {
    this.carregarDados();
  }

  carregarDados() {
    if (!this.endpoint) return;
    this.loading = true;

    this.baseService.listarPaginado(this.endpoint).subscribe({
      next: (res) => {
        this.value = Array.isArray(res) ? res : [];
        this.totalRegistro = this.value.length;
        this.loading = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
