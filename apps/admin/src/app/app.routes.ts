import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users/users-list.component').then((m) => m.UsersListComponent),
      },
      {
        path: 'users/:id',
        loadComponent: () =>
          import('./pages/users/user-detail.component').then((m) => m.UserDetailComponent),
      },
      {
        path: 'wardrobe',
        loadComponent: () =>
          import('./pages/wardrobe/wardrobe-list.component').then((m) => m.WardrobeListComponent),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./pages/events/events-list.component').then((m) => m.EventsListComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
