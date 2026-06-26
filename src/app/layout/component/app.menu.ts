import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `<ul class="layout-menu">
    <ng-container *ngFor="let item of model; let i = index">
      <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
      <li *ngIf="item.separator" class="menu-separator"></li>
    </ng-container>
  </ul> `,
})
export class AppMenu implements OnInit, OnDestroy {
  model: MenuItem[] = [];
  private auth = inject(AuthService);
  private userSub?: Subscription;

  ngOnInit() {
    this.buildMenu();
    this.userSub = this.auth.user$.subscribe(() => this.buildMenu());
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
  }

  private buildMenu() {
    if (this.auth.isSuperAdmin()) {
      this.model = [
        {
          label: 'Administração',
          items: [
            { label: 'Painel', icon: 'pi pi-home', routerLink: ['/admin/home'] },
            { label: 'Organizações', icon: 'pi pi-building', routerLink: ['/admin/organizacoes'] },
            { label: 'Planos', icon: 'pi pi-bookmark', routerLink: ['/admin/planos-assinatura'] },
            { label: 'Papéis', icon: 'pi pi-shield', routerLink: ['/admin/papeis'] },
          ],
        },
      ];
      return;
    }

    const items: MenuItem[] = [
      { label: 'Painel Principal', icon: 'pi pi-home', routerLink: ['/client/home'] },
    ];

    if (this.auth.hasPermission('clientes.ler')) {
      items.push({ label: 'Clientes', icon: 'pi pi-user', routerLink: ['/client/cliente'] });
    }
    if (this.auth.hasPermission('campos-personalizados.ler')) {
      items.push({ label: 'Materiais', icon: 'pi pi-book', routerLink: ['/client/material'] });
    }
    if (this.auth.hasPermission('catalogos.ler')) {
      items.push({ label: 'Catálogo', icon: 'pi pi-book', routerLink: ['/client/catalogo'] });
    }
    if (this.auth.hasPermission('orcamentos.ler')) {
      items.push({ label: 'Orçamentos', icon: 'pi pi-file', routerLink: ['/client/orcamento'] });
    }
    if (this.auth.hasPermission('orcamentos.criar')) {
      items.push({ label: 'Novo Orçamento', icon: 'pi pi-plus', routerLink: ['/client/orcamento/novo'] });
    }
    if (this.auth.hasPermission('condicoes-pagamento.ler')) {
      items.push({
        label: 'Condições de Pagamento',
        icon: 'pi pi-wallet',
        routerLink: ['/client/condicoes-pagamento'],
      });
    }
    if (this.auth.hasAnyPermission('configuracao-orcamento.ler', 'metodos-precificacao.ler')) {
      items.push({ label: 'Configuração', icon: 'pi pi-cog', routerLink: ['/client/configuracao'] });
    }

    this.model = [{ label: 'Menu', items }];
  }
}
