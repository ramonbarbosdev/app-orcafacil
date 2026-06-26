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
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { NgxMaskDirective } from 'ngx-mask';
import { ZodError } from 'zod';
import { LayoutFormSimples } from '../../../components/layouts/layout-form-simples/layout-form-simples';
import { LayoutCampo } from '../../../components/layout-campo/layout-campo';
import { BaseService } from '../../../services/base.service';
import { VinculoOrganizacao } from '../../../models/vinculo-organizacao';
import { VinculoOrganizacaoArraySchema } from '../../../schema/vinculo-organizacao-schema';
import { FlagOption } from '../../../models/flag-option';

@Component({
  selector: 'app-organizacao-vinculo-form',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
    NgxMaskDirective,
    LayoutFormSimples,
    LayoutCampo,
  ],
  templateUrl: './organizacao-vinculo-form.html',
  styleUrl: './organizacao-vinculo-form.scss',
})
export class OrganizacaoVinculoForm {
  @Input() isDialog = false;
  @Output() isDialogChange = new EventEmitter<boolean>();
  @Input() idOrganizacao!: number;
  @Input() nmOrganizacao = '';
  @Input() onSuccess: () => void = () => {};

  loading = false;
  objeto = new VinculoOrganizacao();
  errorValidacao: Record<string, string> = {};

  listaRoles: FlagOption[] = [
    { code: 'ADMIN', name: 'Administrador' },
    { code: 'USER', name: 'Usuário' },
  ];

  private baseService = inject(BaseService);
  private cd = inject(ChangeDetectorRef);

  get titulo(): string {
    const nome = this.nmOrganizacao ? ` — ${this.nmOrganizacao}` : '';
    return `Vincular usuário${nome}`;
  }

  hideDialog() {
    this.isDialog = false;
    this.isDialogChange.emit(false);
    this.limparFormulario();
  }

  onShow() {
    this.limparFormulario();
    this.loading = false;
  }

  onSave() {
    if (!this.idOrganizacao) return;
    if (!this.validarItens()) return;

    this.loading = true;
    const payload = {
      nuCpf: this.objeto.nuCpf.replace(/\D/g, ''),
      nmUsuario: this.objeto.nmUsuario.trim(),
      dsSenha: this.objeto.dsSenha,
      dsRole: this.objeto.dsRole,
    };

    this.baseService
      .post(`admin/organizacoes/${this.idOrganizacao}/vinculos`, payload)
      .subscribe({
        next: () => {
          this.loading = false;
          this.hideDialog();
          this.onSuccess();
          this.cd.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.cd.markForCheck();
        },
      });
  }

  private validarItens(): boolean {
    try {
      VinculoOrganizacaoArraySchema.parse([this.objeto]);
      this.errorValidacao = {};
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        this.errorValidacao = {};
        error.issues.forEach((e) => {
          const field = e.path[1];
          this.errorValidacao[String(field)] = e.message;
        });
        return false;
      }
      return false;
    }
  }

  private limparFormulario() {
    this.objeto = new VinculoOrganizacao();
    this.errorValidacao = {};
  }
}
