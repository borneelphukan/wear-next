import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';
import { AuthService } from '../../services/auth.service';
import { Button } from '../../components/ui/button.component';
import { Input } from '../../components/ui/input.component';
import type { User } from '../../models/admin.models';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [DatePipe, RouterLink, FormsModule, Button, Input],
  template: `
      <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Users</h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage registered users</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <app-ui-input
          [value]="search"
          (valueChange)="search = $event; onSearch()"
          placeholder="Search by name or email…"
          className="max-w-sm"
        />
      </div>

      <div class="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Name</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Items</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Events</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Joined</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            @for (u of users; track u.id) {
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td class="whitespace-nowrap px-4 py-3">
                  <a [routerLink]="['/users', u.id]" class="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                    {{ u.firstName }} {{ u.lastName }}
                  </a>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ u.email }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ u._count?.wardrobes ?? 0 }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ u._count?.calendarEvents ?? 0 }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ u.createdAt | date:'MMM d, y' }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-right">
                  @if (auth.isCEO()) {
                    <app-ui-button variant="ghost" size="sm" (click)="onDelete(u)" className="text-red-600 hover:text-red-800">
                      Delete
                    </app-ui-button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (totalPages > 1) {
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500">
            Page {{ page }} of {{ totalPages }} ({{ total }} users)
          </p>
          <div class="flex gap-2">
            <app-ui-button variant="outline" size="sm" (click)="goTo(page - 1)" [disabled]="page <= 1">
              Prev
            </app-ui-button>
            <app-ui-button variant="outline" size="sm" (click)="goTo(page + 1)" [disabled]="page >= totalPages">
              Next
            </app-ui-button>
          </div>
        </div>
      }
    </div>
  `,
})
export class UsersListComponent implements OnInit {
  private api = inject(AdminApiService);
  protected auth = inject(AuthService);
  users: User[] = [];
  total = 0;
  page = 1;
  totalPages = 1;
  search = '';

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    this.api.getUsers(this.search || undefined, this.page).subscribe((res) => {
      this.users = res.users;
      this.total = res.total;
      this.totalPages = res.totalPages;
    });
  }

  onSearch() {
    this.page = 1;
    this.loadUsers();
  }

  goTo(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadUsers();
  }

  onDelete(u: User) {
    if (!confirm(`Delete user "${u.firstName} ${u.lastName}"? This cannot be undone.`)) return;
    this.api.deleteUser(u.id).subscribe({
      next: () => this.loadUsers(),
      error: () => alert('Failed to delete user'),
    });
  }
}
