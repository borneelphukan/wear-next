import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Button } from '../ui/button.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Button],
  template: `
    <aside
      class="fixed inset-y-0 left-0 z-30 flex flex-col overflow-y-hidden bg-gray-900 text-white transition-all duration-200 dark:bg-gray-950"
      [class.w-64]="!collapsed()"
      [class.w-16]="collapsed()"
    >
      <div class="flex h-16 shrink-0 items-center border-b border-gray-700 px-3" [class.justify-center]="collapsed()" [class.px-6]="!collapsed()">
        @if (!collapsed()) {
          <span class="text-xl font-bold tracking-tight">WearNext</span>
          <span class="ml-2 rounded bg-indigo-500 px-2 py-0.5 text-xs font-semibold">Admin</span>
        }
        <button
          (click)="toggle()"
          class="ml-auto rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          [class.mx-auto]="collapsed()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            @if (collapsed()) {
              <polyline points="9 18 15 12 9 6" />
            } @else {
              <polyline points="15 18 9 12 15 6" />
            }
          </svg>
        </button>
      </div>

      <nav class="min-h-0 flex-1 space-y-1 overflow-y-hidden px-3 py-4">
        @for (item of navItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-gray-700 text-white"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            [class.justify-center]="collapsed()"
            [title]="collapsed() ? item.label : ''"
          >
            <span class="text-lg">{{ item.icon }}</span>
            @if (!collapsed()) {
              {{ item.label }}
            }
          </a>
        }
      </nav>

      <div class="shrink-0 border-t border-gray-700 p-3 space-y-2">
        <a
          routerLink="/settings"
          routerLinkActive="bg-gray-700 text-white"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
          [class.justify-center]="collapsed()"
          [title]="collapsed() ? 'Settings' : ''"
        >
          <span class="text-lg">⚙️</span>
          @if (!collapsed()) {
            Settings
          }
        </a>
        <button
          (click)="showLogoutModal = true"
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
          [class.justify-center]="collapsed()"
          [title]="collapsed() ? 'Logout' : ''"
        >
          <span class="text-lg">🚪</span>
          @if (!collapsed()) {
            Logout
          }
        </button>
      </div>
    </aside>

    @if (showLogoutModal) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900">Confirm Logout</h3>
          <p class="mt-2 text-sm text-gray-500">Are you sure you want to log out of the admin panel?</p>
          <div class="mt-6 flex justify-end gap-3">
            <app-ui-button variant="outline" (click)="showLogoutModal = false">Cancel</app-ui-button>
            <app-ui-button variant="destructive" (click)="onLogout()">Logout</app-ui-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class SidebarComponent {
  constructor(public auth: AuthService) {}

  collapsed = input(false);
  toggleCollapse = output<boolean>();

  showLogoutModal = false;

  navItems = [
    { path: '/', label: 'Dashboard', icon: '📊', exact: true },
    { path: '/users', label: 'Users', icon: '👥', exact: false },
    { path: '/wardrobe', label: 'Wardrobe', icon: '👔', exact: false },
    { path: '/events', label: 'Events', icon: '📅', exact: false },
  ];

  toggle() {
    this.toggleCollapse.emit(!this.collapsed());
  }

  onLogout() {
    this.showLogoutModal = false;
    this.auth.logout();
  }
}
