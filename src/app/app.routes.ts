import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';
import { AppLayout } from './layout/component/app.layout';
import { authGuard } from './auth/auth.guard';
import { Usuariolist } from './pages/dev/usuario/usuariolist/usuariolist';
import { Rolelist } from './pages/dev/role/rolelist/rolelist';
import { Empresalist } from './pages/dev/empresa/empresalist/empresalist';
import { HomeDev } from './pages/dev/home-dev/home-dev';


export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('../app/pages/auth/auth.routes') },

    {
      path: 'dev',
      component: AppLayout,
      canActivateChild: [authGuard],
      data: { roles: ['dev'] },
      children: [
        { path: 'home', component: HomeDev },
        { path: 'usuario', component: Usuariolist },
        { path: 'role', component: Rolelist },
        { path: 'empresa', component: Empresalist },
      ],
    },
  //   {
  //     path: 'client',
  //     component: AppLayout,
  //     canActivateChild: [authGuard],
  //     data: { roles: ['admin', 'dev', 'usuario'] },
  //     children: [
  //       { path: 'home', component: HomeClient },
  //       { path: 'whatsappsessao', component: Sessaolist },
  //     ],
  //   },
];