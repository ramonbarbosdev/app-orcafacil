import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BaseService } from '../../services/base.service';
import { PermissaoModulo } from '../../models/permissao';

@Component({
  selector: 'app-permission-matrix',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AccordionModule,
    CheckboxModule,
    ButtonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './permission-matrix.html',
  styleUrl: './permission-matrix.scss',
})
export class PermissionMatrix implements OnInit, OnChanges {
  @Input() chaves: string[] = [];
  @Input() active = false;
  @Output() chavesChange = new EventEmitter<string[]>();

  catalogo: PermissaoModulo[] = [];
  loading = false;
  activePanels: string[] = [];

  private baseService = inject(BaseService);
  private cd = inject(ChangeDetectorRef);

  get selectedCount(): number {
    return this.chaves.length;
  }

  get totalCount(): number {
    return this.catalogo.reduce((acc, g) => acc + g.permissoes.length, 0);
  }

  ngOnInit() {
    if (this.active) {
      this.carregarCatalogo();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['active']?.currentValue === true && !this.catalogo.length) {
      this.carregarCatalogo();
    }
  }

  private carregarCatalogo() {
    if (this.catalogo.length) {
      return;
    }
    this.loading = true;
    this.baseService.findAll('admin/permissoes').subscribe({
      next: (res: PermissaoModulo[]) => {
        this.catalogo = res;
        this.activePanels = res.slice(0, 3).map((g) => g.modulo);
        this.loading = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }

  isSelected(chave: string): boolean {
    return this.chaves.includes(chave);
  }

  toggle(chave: string, selected: boolean) {
    const next = new Set(this.chaves);
    if (selected) {
      next.add(chave);
    } else {
      next.delete(chave);
    }
    this.emitir([...next].sort());
  }

  marcarModulo(grupo: PermissaoModulo, selected: boolean) {
    const next = new Set(this.chaves);
    grupo.permissoes.forEach((p) => {
      if (selected) {
        next.add(p.nmChave);
      } else {
        next.delete(p.nmChave);
      }
    });
    this.emitir([...next].sort());
  }

  marcarTodas() {
    const next = this.catalogo.flatMap((g) => g.permissoes.map((p) => p.nmChave));
    this.emitir(next.sort());
  }

  limparTodas() {
    this.emitir([]);
  }

  contarSelecionadasModulo(grupo: PermissaoModulo): number {
    return grupo.permissoes.filter((p) => this.chaves.includes(p.nmChave)).length;
  }

  rotuloAcao(acao: string): string {
    const mapa: Record<string, string> = {
      exibir: 'Exibir no menu',
      ler: 'Consultar',
      criar: 'Criar',
      editar: 'Editar',
      deletar: 'Excluir',
    };
    return mapa[acao] ?? acao;
  }

  private emitir(chaves: string[]) {
    this.chaves = chaves;
    this.chavesChange.emit(chaves);
  }
}
