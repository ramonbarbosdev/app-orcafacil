import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { BaseService } from '../../services/base.service';
import { SelectModule } from 'primeng/select';
import { FlagOption } from '../../models/flag-option';
import { PoliticaPlanoResumo } from '../../models/api.types';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-organizacao-plano-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, FormsModule, SelectModule, TableModule],
  templateUrl: './organizacao-plano-dialog.html',
})
export class OrganizacaoPlanoDialog {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() idOrganizacao = 0;
  @Input() nmOrganizacao = '';

  planos: FlagOption[] = [];
  idPlanoSelecionado?: number;
  utilizacao: PoliticaPlanoResumo | null = null;
  statusAssinatura = '';
  loading = false;
  saving = false;

  private baseService = inject(BaseService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  get titulo(): string {
    return `Plano e utilização${this.nmOrganizacao ? ' — ' + this.nmOrganizacao : ''}`;
  }

  onShow() {
    if (!this.idOrganizacao) return;
    this.loading = true;
    this.baseService.findAll('admin/planos-assinatura').subscribe({
      next: (planos: any[]) => {
        this.planos = planos.map((p) => {
          const item = new FlagOption();
          item.code = String(p.idPlanoAssinatura);
          item.name = p.nmPlanoAssinatura;
          return item;
        });
        this.carregarAssinatura();
      },
      error: () => {
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }

  private carregarAssinatura() {
    this.baseService.findAll(`admin/organizacoes/${this.idOrganizacao}/assinatura`).subscribe({
      next: (assinatura: any) => {
        this.statusAssinatura = assinatura?.tpStatus ?? '';
        if (assinatura?.idPlanoAssinatura) {
          this.idPlanoSelecionado = assinatura.idPlanoAssinatura;
        }
        this.carregarUtilizacao();
      },
      error: () => this.carregarUtilizacao(),
    });
  }

  private carregarUtilizacao() {
    this.baseService.findAll(`admin/organizacoes/${this.idOrganizacao}/utilizacao`).subscribe({
      next: (res: PoliticaPlanoResumo) => {
        this.utilizacao = res;
        this.loading = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }

  onHide() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  alterarPlano() {
    if (!this.idOrganizacao || this.idPlanoSelecionado == null) return;
    const idPlano =
      typeof this.idPlanoSelecionado === 'string'
        ? Number(this.idPlanoSelecionado)
        : this.idPlanoSelecionado;
    this.saving = true;
    this.baseService
      .update(`admin/organizacoes/${this.idOrganizacao}/plano`, {
        idPlanoAssinatura: idPlano,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Plano atualizado',
            detail: 'O plano da organização foi alterado.',
          });
          this.onShow();
        },
        error: () => {
          this.saving = false;
          this.cd.markForCheck();
        },
      });
  }
}
