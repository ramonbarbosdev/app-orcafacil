import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';


export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('../app/pages/auth/auth.routes') },

  //   {
  //     path: 'dev',
  //     component: AppLayout,
  //     canActivateChild: [authGuard],
  //     data: { roles: ['dev'] },
  //     children: [
  //       { path: 'home', component: HomeDev },
  //       { path: 'usuario', component: Usuariolist },
  //       { path: 'role', component: Rolelist },
  //       { path: 'empresa', component: Empresalist },
  //     ],
  //   },
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