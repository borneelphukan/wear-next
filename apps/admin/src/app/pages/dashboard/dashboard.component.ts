import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminApiService } from '../../services/admin-api.service';
import { AuthService } from '../../services/auth.service';
import { StatsCardComponent } from '../../components/stats-card/stats-card.component';
import type { DashboardStats } from '../../models/admin.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, StatsCardComponent],
  template: `
    @if (stats) {
      <div class="space-y-8">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h2>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Overview of your platform</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ auth.state()?.user?.firstName }} {{ auth.state()?.user?.lastName }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ auth.state()?.user?.email }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <app-stats-card
            label="Total Users"
            [value]="stats.totalUsers"
            icon="people"
            colorClass="bg-blue-50 text-blue-600"
          />
          <app-stats-card
            label="Wardrobe Items"
            [value]="stats.totalWardrobeItems"
            icon="checkroom"
            colorClass="bg-emerald-50 text-emerald-600"
          />
          <app-stats-card
            label="Calendar Events"
            [value]="stats.totalEvents"
            icon="calendar_today"
            colorClass="bg-amber-50 text-amber-600"
          />
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Recent Users</h3>
            <div class="space-y-3">
              @for (u of stats.recentUsers; track u.id) {
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ u.firstName }} {{ u.lastName }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ u.email }}</p>
                  </div>
                  <span class="text-xs text-gray-400">{{ u.createdAt | date:'MMM d' }}</span>
                </div>
              }
            </div>
          </section>

          <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Recent Items</h3>
            <div class="space-y-3">
              @for (item of stats.recentItems; track item.id) {
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ item.apparel_name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.user?.firstName }} {{ item.user?.lastName }}</p>
                  </div>
                  <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">{{ item.type }}</span>
                </div>
              }
            </div>
          </section>

          <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Recent Events</h3>
            <div class="space-y-3">
              @for (e of stats.recentEvents; track e.id) {
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ e.title }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ e.user?.firstName }} {{ e.user?.lastName }}</p>
                  </div>
                  <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">{{ e.type }}</span>
                </div>
              }
            </div>
          </section>
        </div>
      </div>
    } @else {
      <div class="flex items-center justify-center py-20 text-gray-400">Loading…</div>
    }
  `,
})
export class DashboardComponent implements OnInit {
  private api = inject(AdminApiService);
  protected auth = inject(AuthService);
  stats?: DashboardStats;

  ngOnInit() {
    this.api.getDashboardStats().subscribe((s) => (this.stats = s));
  }
}
