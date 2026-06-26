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
import {
  dataArquivo,
  downloadJson,
  extrairLimites,
  selectJsonFile,
  slugArquivo,
} from '../../utils/config-import-export.util';

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

  exportar() {
    const payload = {
      tipo: 'limites-plano',
      versao: 1,
      nome: this.entityNome,
      id: this.entityId,
      limites: this.limites.map((l) => ({
        nmChaveLimite: l.nmChaveLimite,
        nmLimite: this.nomeLimite(l.nmChaveLimite),
        nuValor: l.nuValor,
      })),
      exportadoEm: new Date().toISOString(),
    };
    downloadJson(`limites-plano-${slugArquivo(this.entityNome)}-${dataArquivo()}.json`, payload);
  }

  importar() {
    selectJsonFile()
      .then((payload) => {
        const importados = extrairLimites(payload);
        if (!importados?.length) {
          throw new Error('Formato inválido. Use um JSON com a lista "limites".');
        }
        if (
          payload &&
          typeof payload === 'object' &&
          'tipo' in (payload as object) &&
          (payload as { tipo?: string }).tipo &&
          (payload as { tipo?: string }).tipo !== 'limites-plano'
        ) {
          throw new Error('Arquivo incompatível. Esperado tipo "limites-plano".');
        }

        const chavesValidas = new Set(this.tiposLimite.map((t) => t.nmChave));
        const desconhecidas = importados
          .map((l) => l.nmChaveLimite)
          .filter((chave) => !chavesValidas.has(chave));
        if (desconhecidas.length) {
          throw new Error(`Limites desconhecidos: ${desconhecidas.join(', ')}`);
        }

        for (const item of importados) {
          const alvo = this.limites.find((l) => l.nmChaveLimite === item.nmChaveLimite);
          if (alvo) {
            alvo.nuValor = item.nuValor;
          }
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Importação concluída',
          detail: `${importados.length} limite(s) carregado(s). Salve para aplicar.`,
        });
        this.cd.markForCheck();
      })
      .catch((erro: Error) => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Não foi possível importar',
          detail: erro.message || 'Arquivo inválido',
        });
      });
  }
}
