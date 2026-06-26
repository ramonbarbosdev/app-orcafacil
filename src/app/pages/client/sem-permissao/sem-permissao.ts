import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import {
  acaoDaPermissao,
  descricaoAcaoPermissao,
  mensagemSemPermissao,
  moduloDaPermissao,
  nomeRecurso,
} from '../../../utils/permission-labels.util';

@Component({
  selector: 'app-sem-permissao',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule],
  templateUrl: './sem-permissao.html',
})
export class SemPermissao implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  titulo = 'Sem permissão para visualizar';
  mensagem = 'Você não possui permissão para acessar este conteúdo.';
  recurso = '';
  acao = '';

  ngOnInit() {
    const permission =
      (this.route.snapshot.queryParamMap.get('permission') ?? '').trim() ||
      this.montarPermissionFromQuery();

    if (permission) {
      this.recurso = moduloDaPermissao(permission);
      this.acao = acaoDaPermissao(permission);
      this.mensagem = mensagemSemPermissao(permission);
      this.titulo = `Sem permissão para ${descricaoAcaoPermissao(this.acao)}`;
      return;
    }

    const recurso = this.route.snapshot.queryParamMap.get('recurso') ?? '';
    const acao = this.route.snapshot.queryParamMap.get('acao') ?? 'ler';
    if (recurso) {
      this.recurso = recurso;
      this.acao = acao;
      this.mensagem = `Você não possui permissão para ${descricaoAcaoPermissao(acao)} em ${nomeRecurso(recurso)}.`;
      this.titulo = `Sem permissão para ${descricaoAcaoPermissao(acao)}`;
    }
  }

  voltarPainel() {
    this.router.navigate(['/client/home']);
  }

  private montarPermissionFromQuery(): string {
    const recurso = this.route.snapshot.queryParamMap.get('recurso');
    const acao = this.route.snapshot.queryParamMap.get('acao') ?? 'ler';
    return recurso ? `${recurso}.${acao}` : '';
  }
}
