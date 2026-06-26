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
import { MessageService } from 'primeng/api';
import { BaseService } from '../../services/base.service';
import { PermissionMatrix } from '../permission-matrix/permission-matrix';
import { PapelDetalhe } from '../../models/permissao';

export type PermissoesEditorMode = 'papel' | 'plano';

@Component({
  selector: 'app-permissoes-editor-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, PermissionMatrix],
  templateUrl: './permissoes-editor-dialog.html',
})
export class PermissoesEditorDialog {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() mode: PermissoesEditorMode = 'papel';
  @Input() entityId = 0;
  @Input() entityNome = '';
  @Input() onSuccess: () => void = () => {};

  chavesSelecionadas: string[] = [];
  saving = false;
  loading = false;

  private baseService = inject(BaseService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  get titulo(): string {
    const nome = this.entityNome ? ` — ${this.entityNome}` : '';
    return this.mode === 'papel' ? `Permissões do papel${nome}` : `Recursos do plano${nome}`;
  }

  onShow() {
    if (!this.entityId) return;
    this.loading = true;
    const endpoint =
      this.mode === 'papel'
        ? `admin/papeis/${this.entityId}`
        : `admin/planos-assinatura/${this.entityId}/permissoes`;

    if (this.mode === 'papel') {
      this.baseService.findById('admin/papeis', this.entityId).subscribe({
        next: (res: PapelDetalhe) => {
          this.chavesSelecionadas = [...(res.chaves ?? [])];
          this.loading = false;
          this.cd.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.cd.markForCheck();
        },
      });
      return;
    }

    this.baseService.findAll(endpoint).subscribe({
      next: (res: string[]) => {
        this.chavesSelecionadas = [...res];
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
    this.chavesSelecionadas = [];
  }

  onSave() {
    if (!this.entityId) return;
    this.saving = true;
    const endpoint =
      this.mode === 'papel'
        ? `admin/papeis/${this.entityId}/permissoes`
        : `admin/planos-assinatura/${this.entityId}/permissoes`;

    this.baseService.update(endpoint, { chaves: this.chavesSelecionadas }).subscribe({
      next: () => {
        this.saving = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Permissões atualizadas',
        });
        this.onHide();
        this.onSuccess();
        this.cd.markForCheck();
      },
      error: () => {
        this.saving = false;
        this.cd.markForCheck();
      },
    });
  }
}
