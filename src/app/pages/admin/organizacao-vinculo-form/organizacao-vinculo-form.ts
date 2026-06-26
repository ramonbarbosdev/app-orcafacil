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
import { VinculoOrganizacao, VinculoOrganizacaoListItem } from '../../../models/vinculo-organizacao';
import {
  VinculoOrganizacaoArraySchema,
  VinculoOrganizacaoEditArraySchema,
} from '../../../schema/vinculo-organizacao-schema';
import { FlagOption } from '../../../models/flag-option';
import { FormatCpfCnpj } from '../../../format/FormatarCpfCnpj';

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
  @Input() idUsuario?: number;
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

  get isEdicao(): boolean {
    return !!this.idUsuario;
  }

  get titulo(): string {
    const nome = this.nmOrganizacao ? ` — ${this.nmOrganizacao}` : '';
    return this.isEdicao ? `Editar usuário${nome}` : `Vincular usuário${nome}`;
  }

  hideDialog() {
    this.isDialog = false;
    this.isDialogChange.emit(false);
    this.limparFormulario();
  }

  onShow() {
    if (this.isEdicao && this.idUsuario) {
      this.carregarVinculo();
      return;
    }
    this.limparFormulario();
    this.loading = false;
  }

  onSave() {
    if (!this.idOrganizacao) return;
    if (!this.validarItens()) return;

    this.loading = true;

    if (this.isEdicao && this.idUsuario) {
      const payload: Record<string, string> = {
        nmUsuario: this.objeto.nmUsuario.trim(),
        dsRole: this.objeto.dsRole,
      };
      if (this.objeto.dsSenha?.trim()) {
        payload['dsSenha'] = this.objeto.dsSenha;
      }

      this.baseService
        .update(`admin/organizacoes/${this.idOrganizacao}/vinculos/${this.idUsuario}`, payload)
        .subscribe({
          next: () => this.finalizarSucesso(),
          error: () => {
            this.loading = false;
            this.cd.markForCheck();
          },
        });
      return;
    }

    const payload = {
      nuCpf: this.objeto.nuCpf.replace(/\D/g, ''),
      nmUsuario: this.objeto.nmUsuario.trim(),
      dsSenha: this.objeto.dsSenha,
      dsRole: this.objeto.dsRole,
    };

    this.baseService.post(`admin/organizacoes/${this.idOrganizacao}/vinculos`, payload).subscribe({
      next: () => this.finalizarSucesso(),
      error: () => {
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }

  private carregarVinculo() {
    this.loading = true;
    this.baseService.findAll(`admin/organizacoes/${this.idOrganizacao}/vinculos`).subscribe({
      next: (lista: VinculoOrganizacaoListItem[]) => {
        const item = lista.find((v) => v.idUsuario === this.idUsuario);
        if (item) {
          this.objeto = {
            idUsuario: item.idUsuario,
            nuCpf: FormatCpfCnpj(item.nuCpf),
            nmUsuario: item.nmUsuario,
            dsSenha: '',
            dsRole: item.dsRole,
          };
        }
        this.loading = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }

  private finalizarSucesso() {
    this.loading = false;
    this.hideDialog();
    this.onSuccess();
    this.cd.markForCheck();
  }

  private validarItens(): boolean {
    try {
      if (this.isEdicao) {
        VinculoOrganizacaoEditArraySchema.parse([
          {
            nmUsuario: this.objeto.nmUsuario,
            dsSenha: this.objeto.dsSenha,
            dsRole: this.objeto.dsRole,
          },
        ]);
      } else {
        VinculoOrganizacaoArraySchema.parse([this.objeto]);
      }
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
