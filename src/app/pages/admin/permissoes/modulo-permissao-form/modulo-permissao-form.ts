import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ZodError } from 'zod';
import { BaseService } from '../../../../services/base.service';
import { LayoutFormSimples } from '../../../../components/layouts/layout-form-simples/layout-form-simples';
import { LayoutCampo } from '../../../../components/layout-campo/layout-campo';
import {
  ModuloPermissaoCreateSchema,
  ModuloPermissaoUpdateSchema,
} from '../../../../schema/modulo-permissao-schema';
import { ModuloPermissaoAdmin } from '../../../../models/permissao';

@Component({
  selector: 'app-modulo-permissao-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    ToggleSwitchModule,
    LayoutFormSimples,
    LayoutCampo,
  ],
  templateUrl: './modulo-permissao-form.html',
})
export class ModuloPermissaoForm {
  @Input() isDialog = false;
  @Output() isDialogChange = new EventEmitter<boolean>();
  @Input() onReloadList: () => void = () => {};
  @Input() key = '';

  loading = false;
  codigoModulo = '';
  nmModulo = '';
  flAtivo = true;
  errorValidacao: Record<string, string> = {};

  private endpoint = 'admin/recursos';
  private baseService = inject(BaseService);
  private cd = inject(ChangeDetectorRef);

  get isEdicao(): boolean {
    return !!this.key;
  }

  get titulo(): string {
    return this.isEdicao ? 'Editar recurso' : 'Novo recurso';
  }

  hideDialog() {
    this.isDialog = false;
    this.isDialogChange.emit(false);
    this.limparFormulario();
  }

  onShow() {
    this.limparFormulario();
    if (!this.isEdicao) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.baseService.findById(this.endpoint, this.key).subscribe({
      next: (res: ModuloPermissaoAdmin) => {
        this.codigoModulo = res.modulo;
        this.nmModulo = res.nmModulo;
        this.flAtivo = res.flAtivo;
        this.loading = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.hideDialog();
      },
    });
  }

  onSave() {
    this.errorValidacao = {};
    try {
      if (this.isEdicao) {
        ModuloPermissaoUpdateSchema.parse({ nmModulo: this.nmModulo, flAtivo: this.flAtivo });
        this.loading = true;
        this.baseService
          .update(`${this.endpoint}/${this.key}`, { nmModulo: this.nmModulo, flAtivo: this.flAtivo })
          .subscribe({
            next: () => {
              this.loading = false;
              this.onReloadList();
              this.hideDialog();
            },
            error: () => {
              this.loading = false;
            },
          });
      } else {
        const codigo = this.codigoModulo.trim().toLowerCase();
        ModuloPermissaoCreateSchema.parse({ codigoModulo: codigo, nmModulo: this.nmModulo });
        this.loading = true;
        this.baseService
          .create(this.endpoint, { codigoModulo: codigo, nmModulo: this.nmModulo })
          .subscribe({
            next: () => {
              this.loading = false;
              this.onReloadList();
              this.hideDialog();
            },
            error: () => {
              this.loading = false;
            },
          });
      }
    } catch (e) {
      if (e instanceof ZodError) {
        for (const issue of e.issues) {
          const field = issue.path[0];
          if (typeof field === 'string') {
            this.errorValidacao[field] = issue.message;
          }
        }
      }
    }
  }

  private limparFormulario() {
    this.codigoModulo = '';
    this.nmModulo = '';
    this.flAtivo = true;
    this.errorValidacao = {};
  }
}
