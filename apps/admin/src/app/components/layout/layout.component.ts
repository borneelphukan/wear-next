import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
      <app-sidebar
        [collapsed]="collapsed()"
        (toggleCollapse)="onToggleCollapse($event)"
      />
      <main
        class="min-h-screen overflow-y-auto p-8 transition-all duration-200"
        [class.ml-64]="!collapsed()"
        [class.ml-16]="collapsed()"
      >
        <router-outlet />
      </main>
    </div>
  `,
})
export class LayoutComponent {
  auth = inject(AuthService);
  collapsed = signal(localStorage.getItem('sidebar_collapsed') === 'true');

  constructor() {
    if (this.auth.state()?.user?.darkMode) {
      document.documentElement.classList.add('dark');
    }
  }

  onToggleCollapse(v: boolean) {
    this.collapsed.set(v);
    localStorage.setItem('sidebar_collapsed', String(v));
  }
}
