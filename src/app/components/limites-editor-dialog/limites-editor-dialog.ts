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
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';

export interface TipoLimite {
  nmChave: string;
  nmLimite: string;
  dsLimite?: string;
  tpLimite: string;
}

export interface PlanoLimiteItem {
  nmChaveLimite: string;
  nuValor: number | null;
}

@Component({
  selector: 'app-limites-editor-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, FormsModule, InputNumberModule, TableModule],
  templateUrl: './limites-editor-dialog.html',
})
export class LimitesEditorDialog {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() entityId = 0;
  @Input() entityNome = '';
  @Input() onSuccess: () => void = () => {};

  tiposLimite: TipoLimite[] = [];
  limites: PlanoLimiteItem[] = [];
  saving = false;
  loading = false;

  private baseService = inject(BaseService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  get titulo(): string {
    const nome = this.entityNome ? ` — ${this.entityNome}` : '';
    return `Limites do plano${nome}`;
  }

  onShow() {
    if (!this.entityId) return;
    this.loading = true;
    this.baseService.findAll('admin/planos-assinatura/tipos-limite').subscribe({
      next: (tipos: TipoLimite[]) => {
        this.tiposLimite = tipos;
        this.baseService.findAll(`admin/planos-assinatura/${this.entityId}/limites`).subscribe({
          next: (atuais: PlanoLimiteItem[]) => {
            this.limites = tipos.map((tipo) => {
              const existente = atuais.find((l) => l.nmChaveLimite === tipo.nmChave);
              return {
                nmChaveLimite: tipo.nmChave,
                nuValor: existente?.nuValor ?? null,
              };
            });
            this.loading = false;
            this.cd.markForCheck();
          },
          error: () => {
            this.loading = false;
            this.cd.markForCheck();
          },
        });
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

  nomeLimite(chave: string): string {
    return this.tiposLimite.find((t) => t.nmChave === chave)?.nmLimite ?? chave;
  }

  onSave() {
    if (!this.entityId) return;
    this.saving = true;
    this.baseService
      .update(`admin/planos-assinatura/${this.entityId}/limites`, { limites: this.limites })
      .subscribe({
        next: () => {
          this.saving = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Limites atualizados',
            detail: 'Os limites do plano foram salvos.',
          });
          this.onSuccess();
          this.onHide();
        },
        error: () => {
          this.saving = false;
          this.cd.markForCheck();
        },
      });
  }
}
