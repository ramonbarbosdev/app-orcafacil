import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { authGuard } from './auth/auth.guard';
import { orgSelectedGuard } from './auth/org-selected.guard';
import { adminGuard } from './auth/admin.guard';
import { permissionGuard } from './auth/permission.guard';
import { HomeAdmin } from './pages/admin/home-admin/home-admin';
import { Planoassinaturalist } from './pages/dev/planoassinatura/planoassinaturalist/planoassinaturalist';
import { Empresalist } from './pages/dev/empresa/empresalist/empresalist';
import { HomeClient } from './pages/client/home-client/home-client';
import { Clientelist } from './pages/client/cliente/clientelist/clientelist';
import { Categoriaservicolist } from './pages/client/categoriaservico/categoriaservicolist/categoriaservicolist';
import { Servicolist } from './pages/client/servico/servicolist/servicolist';
import { ConfiguracaoView } from './pages/client/configuracao-view/configuracao-view';
import { Condicaopagamentolist } from './pages/dev/condicaopagamento/condicaopagamentolist/condicaopagamentolist';
import { Orcamentolist } from './pages/client/orcamento/orcamentolist/orcamentolist';
import { Orcamentoform } from './pages/client/orcamento/orcamentoform/orcamentoform';
import { Catalogolist } from './pages/client/catalogo/catalogolist/catalogolist';
import { Orcamentoview } from './pages/client/orcamento/orcamentoview/orcamentoview';
import { Materiallist } from './pages/client/material/materiallist/materiallist';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('../app/pages/auth/auth.routes') },
  { path: 'public/orcamento/view/:codigo', component: Orcamentoview },
  { path: 'visualizar/:codigo', component: Orcamentoview },

  {
    path: 'admin',
    component: AppLayout,
    canActivateChild: [adminGuard],
    children: [
      { path: 'home', component: HomeAdmin },
      { path: 'organizacoes', component: Empresalist },
      { path: 'planos-assinatura', component: Planoassinaturalist },
    ],
  },
  {
    path: 'client',
    component: AppLayout,
    canActivateChild: [authGuard, orgSelectedGuard],
    children: [
      { path: 'home', component: HomeClient },
      {
        path: 'configuracao',
        component: ConfiguracaoView,
        canActivate: [permissionGuard],
        data: { permission: 'configuracao-orcamento.ler' },
      },
      {
        path: 'cliente',
        component: Clientelist,
        canActivate: [permissionGuard],
        data: { permission: 'clientes.ler' },
      },
      {
        path: 'categoriaservico',
        component: Categoriaservicolist,
        canActivate: [permissionGuard],
        data: { permission: 'categorias-servico.ler' },
      },
      {
        path: 'servico',
        component: Servicolist,
        canActivate: [permissionGuard],
        data: { permission: 'servicos.ler' },
      },
      {
        path: 'material',
        component: Materiallist,
        canActivate: [permissionGuard],
        data: { permission: 'campos-personalizados.ler' },
      },
      {
        path: 'catalogo',
        component: Catalogolist,
        canActivate: [permissionGuard],
        data: { permission: 'catalogos.ler' },
      },
      {
        path: 'condicoes-pagamento',
        component: Condicaopagamentolist,
        canActivate: [permissionGuard],
        data: { permission: 'condicoes-pagamento.ler' },
      },
      {
        path: 'orcamento',
        component: Orcamentolist,
        canActivate: [permissionGuard],
        data: { permission: 'orcamentos.ler' },
      },
      {
        path: 'orcamento/novo',
        component: Orcamentoform,
        canActivate: [permissionGuard],
        data: { permission: 'orcamentos.criar' },
      },
      {
        path: 'orcamento/:id',
        component: Orcamentoform,
        canActivate: [permissionGuard],
        data: { permission: 'orcamentos.ler' },
      },
    ],
  },
];
