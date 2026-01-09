import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { LoadingService } from '../../services/loading.service';
import { AuthService } from '../../auth/auth.service';

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
export class AppMenu {
  model: MenuItem[] = [];
  auth = inject(AuthService);

  ngOnInit() {
    const role = this.auth.getUserSubbject().role;
    const isAreaDev = this.auth.getUserSubbject().isAreaDev;

    if (isAreaDev && role === 'ROLE_DEV') {
      this.model.push({
        label: 'Administração',
        items: [
          {
            label: 'Painel',
            icon: 'pi pi-fw pi-bookmark',
            routerLink: ['/dev/home'],
          },
          {
            label: 'Empresas',
            items: [
              {
                label: 'Planos',
                icon: 'pi pi-fw pi-bookmark',
                routerLink: ['/dev/planoassinatura'],
              },
              {
                label: 'Empresas',
                icon: 'pi pi-fw pi-bookmark',
                routerLink: ['/dev/empresa'],
              },
              {
                label: 'Método de Precificação',
                icon: 'pi pi-fw pi-bookmark',
                routerLink: ['metodoprecificacao'],
              },
            ],
          },
          {
            label: 'Usuarios',
            items: [
              {
                label: 'Permissões',
                icon: 'pi pi-fw pi-bookmark',
                routerLink: ['/dev/role'],
              },
              {
                label: 'Usuarios',
                icon: 'pi pi-fw pi-bookmark',
                routerLink: ['/dev/usuario'],
              },
            ],
          },
          {
            label: 'Configuração geral',
            items: [
              {
                label: 'Condição de Pagamento',
                icon: 'pi pi-fw pi-bookmark',
                routerLink: ['/dev/condicaopagamento'],
              },

            ],
          },
        ],
      });
    } else {


      this.model = [
        {
          label: 'Início',
          items: [
            {
              label: 'Painel Principal',
              icon: 'pi pi-fw pi-home',
              routerLink: ['/client/home'],
            },
          ],
        },
        {
          label: 'Gerenciamentos',
          items: [
            {
              label: 'Clientes',
              icon: 'pi pi-user',
              routerLink: ['/client/cliente'],
            },
            {
              label: 'Catalogo',
              icon: 'pi pi-book',
              routerLink: ['catalogo'],
            },
            {
              label: 'Orçamentos',
              icon: 'pi pi-file',
              routerLink: ['/client/orcamento'],
            },
            {
              label: 'Novo Orçamento',
              icon: 'pi pi-plus',
              routerLink: ['/client/orcamento/novo'],
            },
            {
              label: 'Configuração',
              icon: 'pi pi-cog',
              routerLink: ['/client/configuracao'],
            },
          ],
        },

      ];

      if (role === 'ROLE_ADMIN' && role === 'ROLE_DEV') {
        this.model.push({
          label: 'Administração',
          items: [

          ],
        });
      }
    }
  }
}
