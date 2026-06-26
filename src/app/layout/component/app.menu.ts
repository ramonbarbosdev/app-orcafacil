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
            { label: 'Recursos', icon: 'pi pi-key', routerLink: ['/admin/permissoes'] },
          ],
        },
      ];
      return;
    }

    const items: MenuItem[] = [
      { label: 'Painel Principal', icon: 'pi pi-home', routerLink: ['/client/home'] },
    ];

    if (this.auth.canShowInMenu('clientes')) {
      items.push({ label: 'Clientes', icon: 'pi pi-user', routerLink: ['/client/cliente'] });
    }
    if (this.auth.canShowInMenu('campos-personalizados')) {
      items.push({ label: 'Materiais', icon: 'pi pi-book', routerLink: ['/client/material'] });
    }
    if (this.auth.canShowInMenu('catalogos')) {
      items.push({ label: 'Catálogo', icon: 'pi pi-book', routerLink: ['/client/catalogo'] });
    }
    if (this.auth.canShowInMenu('orcamentos')) {
      items.push({ label: 'Orçamentos', icon: 'pi pi-file', routerLink: ['/client/orcamento'] });
    }
    if (this.auth.canShowInMenu('orcamentos') && this.auth.hasPermission('orcamentos.criar')) {
      items.push({ label: 'Novo Orçamento', icon: 'pi pi-plus', routerLink: ['/client/orcamento/novo'] });
    }
    if (this.auth.canShowInMenu('condicoes-pagamento')) {
      items.push({
        label: 'Condições de Pagamento',
        icon: 'pi pi-wallet',
        routerLink: ['/client/condicoes-pagamento'],
      });
    }
    if (
      this.auth.canShowInMenu('configuracao-orcamento') ||
      this.auth.canShowInMenu('metodos-precificacao') ||
      this.auth.canShowInMenu('campos-personalizados') ||
      this.auth.canShowInMenu('metodos-ajuste') ||
      this.auth.canShowInMenu('empresa-metodos-precificacao')
    ) {
      items.push({ label: 'Configuração', icon: 'pi pi-cog', routerLink: ['/client/configuracao'] });
    }

    this.model = [{ label: 'Menu', items }];
  }
}
