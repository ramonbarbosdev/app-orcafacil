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
            icon: 'pi pi-fw pi-bookmark',
            routerLink: ['/dev/empresa'],
          },
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
            {
              label: 'Gerenciamento de Sessão',
              icon: 'pi pi-fw pi-home',
              routerLink: ['/client/whatsappsessao'],
            },
          ],
        },
      ];

      if (role === 'ROLE_ADMIN' && role === 'ROLE_DEV') {
        this.model.push({
          label: 'Administração',
          items: [
            {
              label: 'Tipo de Serviço',
              icon: 'pi pi-fw pi-bookmark',
              routerLink: ['/admin/tiposervico'],
            },
            {
              label: 'Relatório Administrativo',
              icon: 'pi pi-address-book',
              items: [
                {
                  label: 'Relatório Agronegócios',
                  icon: 'pi pi-book',
                  routerLink: ['/admin/projetocreditoruralvisualizacao'],
                },
                {
                  label: 'Relatório Consórcio',
                  icon: 'pi pi-book',
                  routerLink: ['/admin/projetoconsorciovisualizacao'],
                },
                {
                  label: 'Relatório Crédito Pessoal',
                  icon: 'pi pi-book',
                  routerLink: ['/admin/projetocreditopessoalvisualizacao'],
                },
                {
                  label: 'Relatório Abertura de Contas',
                  icon: 'pi pi-book',
                  routerLink: ['/admin/projetoaberturacontavisualizacao'],
                },
                {
                  label: 'Resumo por Projetista',
                  icon: 'pi pi-book',
                  routerLink: ['/admin/resumoprojetistavisualizacao'],
                },
                {
                  label: 'Resumo Visitas',
                  icon: 'pi pi-book',
                  routerLink: ['/admin/resumovisitavisualizacao'],
                },
              ],
            },
            {
              label: 'Parâmetros',
              icon: 'pi pi-chart-bar',
              routerLink: ['/client/relatorios'],
              items: [
                {
                  label: 'Categoria do Parâmetro',
                  icon: 'pi pi-fw pi-bookmark',
                  routerLink: ['/admin/categoriaparametro'],
                },
                {
                  label: 'Parâmetro do Sistema',
                  icon: 'pi pi-fw pi-bookmark',
                  routerLink: ['/admin/parametromaster'],
                },
              ],
            },

            {
              label: 'Permissões',
              icon: 'pi pi-fw pi-bookmark',
              routerLink: ['/admin/role'],
            },
            {
              label: 'Usuarios',
              icon: 'pi pi-fw pi-bookmark',
              routerLink: ['/admin/usuario'],
            },
          ],
        });
      }
    }
  }
}
