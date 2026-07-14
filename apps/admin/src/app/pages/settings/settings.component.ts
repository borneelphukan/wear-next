import { Component, OnInit, inject } from '@angular/core';
import { AdminApiService } from '../../services/admin-api.service';
import { AuthService } from '../../services/auth.service';
import { Button } from '../../components/ui/button.component';
import type { AdminRole } from '../../models/admin.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [Button, FormsModule],
  template: `
    <div class="space-y-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your admin account</p>
      </div>

      <div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance</h3>
        <div class="mt-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Toggle dark mode for the admin panel</p>
          </div>
          <button
            type="button"
            role="switch"
            [attr.aria-checked]="darkMode"
            (click)="toggleDarkMode()"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            [class.bg-indigo-600]="darkMode"
            [class.bg-gray-200]="!darkMode"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform"
              [class.translate-x-5]="darkMode"
              [class.translate-x-0]="!darkMode"
            ></span>
          </button>
        </div>
      </div>

      <div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Role</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Current role: <span class="font-medium text-gray-900 dark:text-gray-100">{{ currentRoleLabel }}</span>
        </p>
        <div class="mt-4 space-y-3">
          @for (r of roles; track r.value) {
            <label class="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              [class.border-indigo-500]="selectedRole === r.value"
              [class.dark:border-indigo-400]="selectedRole === r.value">
              <input
                type="radio"
                name="role"
                [value]="r.value"
                [(ngModel)]="selectedRole"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ r.label }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ r.description }}</p>
              </div>
            </label>
          }
        </div>
        @if (roleError) {
          <p class="mt-2 text-sm text-red-600">{{ roleError }}</p>
        }
        @if (roleSaved) {
          <p class="mt-2 text-sm text-green-600">Role updated successfully</p>
        }
        <app-ui-button
          variant="primary"
          className="mt-4"
          [disabled]="selectedRole === auth.state()?.user?.role"
          (click)="saveRole()"
        >
          Save Role
        </app-ui-button>
      </div>

      <div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
        <h3 class="text-lg font-semibold text-red-600">Danger Zone</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <app-ui-button
          variant="destructive"
          [loading]="deleting"
          [disabled]="deleting"
          (click)="onDeleteAccount()"
        >
          {{ deleting ? 'Deleting…' : 'Delete Account' }}
        </app-ui-button>
        @if (error) {
          <p class="mt-2 text-sm text-red-600">{{ error }}</p>
        }
      </div>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  private api = inject(AdminApiService);
  protected auth = inject(AuthService);

  roles: { value: AdminRole; label: string; description: string }[] = [
    { value: 'CEO', label: 'CEO', description: 'Full access to all features including deletion' },
    { value: 'PROJECT_MANAGER', label: 'Project Manager', description: 'Manage projects and view data. Cannot delete.' },
    { value: 'SALES', label: 'Sales', description: 'View sales data. Cannot delete.' },
    { value: 'HR', label: 'HR', description: 'Manage HR data. Cannot delete.' },
  ];

  selectedRole: AdminRole = 'PROJECT_MANAGER';
  darkMode = false;
  roleError = '';
  roleSaved = false;
  deleting = false;
  error = '';

  ngOnInit() {
    const user = this.auth.state()?.user;
    if (user) {
      this.selectedRole = user.role;
      this.darkMode = user.darkMode;
      if (this.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  get currentRoleLabel() {
    return this.roles.find((r) => r.value === this.selectedRole)?.label || this.selectedRole;
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    this.api.updateSettings({ darkMode: this.darkMode }).subscribe({
      next: (res) => {
        const user = this.auth.state()?.user;
        if (user) {
          this.auth.updateState({ ...user, darkMode: this.darkMode });
        }
        if (this.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    });
  }

  saveRole() {
    this.roleError = '';
    this.roleSaved = false;
    this.api.updateSettings({ role: this.selectedRole }).subscribe({
      next: (res) => {
        this.roleSaved = true;
        const user = this.auth.state()?.user;
        if (user) {
          this.auth.updateState({ ...user, role: this.selectedRole });
        }
        setTimeout(() => (this.roleSaved = false), 2000);
      },
      error: (err) => {
        this.roleError = err.error?.message || 'Failed to update role';
      },
    });
  }

  onDeleteAccount() {
    if (!confirm('Are you sure you want to delete your admin account? This cannot be undone.')) return;
    if (!confirm('This will permanently delete your account. Continue?')) return;

    this.deleting = true;
    this.error = '';
    this.api.deleteAdminAccount().subscribe({
      next: () => {
        this.auth.logout();
      },
      error: (err) => {
        this.deleting = false;
        this.error = err.error?.message || 'Failed to delete account';
      },
    });
  }
}
