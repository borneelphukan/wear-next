import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';
import { AuthService } from '../../services/auth.service';
import { Button } from '../../components/ui/button.component';
import { Input } from '../../components/ui/input.component';
import type { CalendarEvent, EventStats } from '../../models/admin.models';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [FormsModule, Button, Input],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Events</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">All calendar events across users</p>
      </div>

      @if (stats) {
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400">Total Events</p>
            <p class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ stats.totalEvents }}</p>
          </div>
          <div class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400">Active Users</p>
            <p class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ stats.uniqueUsers }}</p>
          </div>
          <div class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400">Event Types</p>
            <p class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ stats.byType.length }}</p>
          </div>
        </div>

        @if (stats.byType.length) {
          <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">By Type</h4>
            <div class="flex flex-wrap gap-2">
              @for (entry of stats.byType; track entry.type) {
                <span class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {{ entry.type }} ({{ entry._count }})
                </span>
              }
            </div>
          </section>
        }
      }

      <div class="flex items-center gap-3">
        <app-ui-input
          [value]="search"
          (valueChange)="search = $event; onSearch()"
          placeholder="Search events…"
          className="max-w-sm"
        />
      </div>

      <div class="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Title</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">User</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Type</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Date</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Time</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            @for (e of events; track e.id) {
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td class="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{{ e.title }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ e.user?.firstName }} {{ e.user?.lastName }}</td>
                <td class="whitespace-nowrap px-4 py-3">
                  <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">{{ e.type }}</span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ e.dateKey }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ e.time || e.from || '—' }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-right">
                  @if (auth.isCEO()) {
                    <app-ui-button variant="ghost" size="sm" (click)="onDelete(e)" className="text-red-600 hover:text-red-800">Delete</app-ui-button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (totalPages > 1) {
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500">Page {{ page }} of {{ totalPages }} ({{ total }} events)</p>
          <div class="flex gap-2">
            <app-ui-button variant="outline" size="sm" (click)="goTo(page - 1)" [disabled]="page <= 1">Prev</app-ui-button>
            <app-ui-button variant="outline" size="sm" (click)="goTo(page + 1)" [disabled]="page >= totalPages">Next</app-ui-button>
          </div>
        </div>
      }
    </div>
  `,
})
export class EventsListComponent implements OnInit {
  private api = inject(AdminApiService);
  protected auth = inject(AuthService);
  events: CalendarEvent[] = [];
  stats?: EventStats;
  total = 0;
  page = 1;
  totalPages = 1;
  search = '';

  ngOnInit() {
    this.api.getEventStats().subscribe((s) => (this.stats = s));
    this.loadEvents();
  }

  private loadEvents() {
    this.api.getEvents(this.search || undefined, this.page).subscribe((res) => {
      this.events = res.events;
      this.total = res.total;
      this.totalPages = res.totalPages;
    });
  }

  onSearch() {
    this.page = 1;
    this.loadEvents();
  }

  goTo(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadEvents();
  }

  onDelete(e: CalendarEvent) {
    if (!confirm(`Delete event "${e.title}"?`)) return;
    this.api.deleteEvent(e.id).subscribe({
      next: () => this.loadEvents(),
      error: () => alert('Failed to delete event'),
    });
  }
}
