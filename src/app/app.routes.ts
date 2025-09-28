import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home').then(m => m.Home)
  },
  {
    path: 'user/:id',
    loadComponent: () => import('./components/user-detail/user-detail').then(m => m.UserDetail)
  },
  {
    path: 'newuser',
    loadComponent: () => import('./components/user-form/user-form').then(m => m.UserForm)
  },
  {
    path: 'updateuser/:id',
    loadComponent: () => import('./components/user-form/user-form').then(m => m.UserForm)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
