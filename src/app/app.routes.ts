import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  // Redirect legacy 'results' to new 'recherches'
  { path: 'results', pathMatch: 'full', redirectTo: 'recherches' },
  {
    path: 'recherches',
    loadComponent: () => import('./pages/results/results.component').then(m => m.ResultsComponent),
    canActivate: [() => import('./guards/user.guard').then(g => g.userOnlyGuard)]
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history.component').then(m => m.HistoryComponent),
    canActivate: [() => import('./guards/user.guard').then(g => g.userOnlyGuard)]
  },
  {
    path: 'employee/:id',
    loadComponent: () => import('./pages/employee-detail/employee-detail.component').then(m => m.EmployeeDetailComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [() => import('./guards/auth.guard').then(g => g.authGuard)]
  },
  {
    path: 'admin/directions',
    loadComponent: () => import('./pages/admin/admin-direction.component').then(m => m.AdminDirectionComponent),
    canActivate: [() => import('./guards/auth.guard').then(g => g.authGuard)]
  },
  {
    path: 'admin/list',
    loadComponent: () => import('./pages/admin/admin-list.component').then(m => m.AdminListComponent),
    canActivate: [() => import('./guards/auth.guard').then(g => g.authGuard)]
  },
  {
    path: 'admin/services',
    loadComponent: () => import('./pages/admin/admin-service.component').then(m => m.AdminServiceComponent),
    canActivate: [() => import('./guards/auth.guard').then(g => g.authGuard)]
  },
  {
    path: 'admin/employees',
    loadComponent: () => import('./pages/admin/admin-employee.component').then(m => m.AdminEmployeeComponent),
    canActivate: [() => import('./guards/auth.guard').then(g => g.authGuard)]
  },
  { path: '**', redirectTo: '' }
];
