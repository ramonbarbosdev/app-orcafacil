import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BaseService } from '../../../services/base.service';
import { VinculoOrganizacaoListItem } from '../../../models/vinculo-organizacao';
import { OrganizacaoVinculoForm } from '../organizacao-vinculo-form/organizacao-vinculo-form';
import { FormatCpfCnpj } from '../../../format/FormatarCpfCnpj';

@Component({
  selector: 'app-organizacao-usuarios-dialog',
  imports: [
    CommonModule,
    DialogModule,
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    OrganizacaoVinculoForm,
  ],
  providers: [ConfirmationService],
  templateUrl: './organizacao-usuarios-dialog.html',
  styleUrl: './organizacao-usuarios-dialog.scss',
})
export class OrganizacaoUsuariosDialog {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() idOrganizacao = 0;
  @Input() nmOrganizacao = '';

  usuarios: VinculoOrganizacaoListItem[] = [];
  loading = false;
  isFormDialog = false;
  idUsuarioEdicao?: number;

  private baseService = inject(BaseService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  get titulo(): string {
    const nome = this.nmOrganizacao ? ` — ${this.nmOrganizacao}` : '';
    return `Usuários da organização${nome}`;
  }

  onDialogShow() {
    this.carregarUsuarios();
  }

  onDialogHide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.usuarios = [];
  }

  onNovo() {
    this.idUsuarioEdicao = undefined;
    this.isFormDialog = true;
  }

  onEditar(row: VinculoOrganizacaoListItem) {
    this.idUsuarioEdicao = row.idUsuario;
    this.isFormDialog = true;
  }

  onExcluir(row: VinculoOrganizacaoListItem) {
    this.confirmationService.confirm({
      message: `Remover o vínculo de ${row.nmUsuario} com esta organização?`,
      header: 'Confirmar exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.baseService
          .deleteById(`admin/organizacoes/${this.idOrganizacao}/vinculos`, row.idUsuario)
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Vínculo removido',
                detail: 'O usuário foi desvinculado da organização.',
              });
              this.carregarUsuarios();
            },
            error: () => {
              this.loading = false;
              this.cd.markForCheck();
            },
          });
      },
    });
  }

  onFormSuccess = () => {
    this.messageService.add({
      severity: 'success',
      summary: this.idUsuarioEdicao ? 'Usuário atualizado' : 'Usuário vinculado',
      detail: this.idUsuarioEdicao
        ? 'Os dados do vínculo foram atualizados.'
        : 'O usuário foi cadastrado e vinculado à organização.',
    });
    this.idUsuarioEdicao = undefined;
    this.carregarUsuarios();
  };

  formatarCpf(cpf: string): string {
    return FormatCpfCnpj(cpf);
  }

  formatarRole(role: string): string {
    return role === 'ADMIN' ? 'Administrador' : 'Usuário';
  }

  private carregarUsuarios() {
    if (!this.idOrganizacao) return;
    this.loading = true;

    this.baseService.findAll(`admin/organizacoes/${this.idOrganizacao}/vinculos`).subscribe({
      next: (res) => {
        this.usuarios = Array.isArray(res) ? res : [];
        this.loading = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.usuarios = [];
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }
}
