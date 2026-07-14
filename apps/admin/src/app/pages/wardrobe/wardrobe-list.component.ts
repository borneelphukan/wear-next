import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';
import { AuthService } from '../../services/auth.service';
import { Button } from '../../components/ui/button.component';
import { Input } from '../../components/ui/input.component';
import type { WardrobeItem, WardrobeStats } from '../../models/admin.models';

@Component({
  selector: 'app-wardrobe-list',
  standalone: true,
  imports: [DatePipe, FormsModule, Button, Input],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Wardrobe</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">All wardrobe items across users</p>
      </div>

      @if (stats) {
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p class="text-xs text-gray-500">Total Items</p>
            <p class="text-xl font-bold text-gray-900">{{ stats.totalItems }}</p>
          </div>
          <div class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p class="text-xs text-gray-500">Types</p>
            <p class="text-xl font-bold text-gray-900">{{ stats.byType.length }}</p>
          </div>
          <div class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p class="text-xs text-gray-500">Materials</p>
            <p class="text-xl font-bold text-gray-900">{{ stats.byMaterial.length }}</p>
          </div>
          <div class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <p class="text-xs text-gray-500">Seasons</p>
            <p class="text-xl font-bold text-gray-900">{{ stats.bySeason.length }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6 lg:grid-cols-4">
          <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">By Type</h4>
            <div class="space-y-1">
              @for (entry of stats.byType.slice(0, 6); track $index) {
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-700 dark:text-gray-300">{{ entry.type }}</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ entry._count }}</span>
                </div>
              }
            </div>
          </section>
          <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">By Material</h4>
            <div class="space-y-1">
              @for (entry of stats.byMaterial.slice(0, 6); track $index) {
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-700 dark:text-gray-300">{{ entry.material }}</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ entry._count }}</span>
                </div>
              }
            </div>
          </section>
          <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">By Color</h4>
            <div class="space-y-1">
              @for (entry of stats.byColor.slice(0, 6); track $index) {
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-700 dark:text-gray-300">{{ entry.color }}</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ entry._count }}</span>
                </div>
              }
            </div>
          </section>
          <section class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">By Season</h4>
            <div class="space-y-1">
              @for (entry of stats.bySeason.slice(0, 6); track $index) {
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-700 dark:text-gray-300">{{ entry.season }}</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ entry._count }}</span>
                </div>
              }
            </div>
          </section>
        </div>
      }

      <div class="flex items-center gap-3">
        <app-ui-input
          [value]="search"
          (valueChange)="search = $event; onSearch()"
          placeholder="Search items…"
          className="max-w-sm"
        />
      </div>

      <div class="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Item</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">User</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Type</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Material</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Color</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Season</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Added</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            @for (item of items; track item.id) {
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td class="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{{ item.apparel_name }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ item.user?.firstName }} {{ item.user?.lastName }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ item.type }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ item.material }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ item.color }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ item.season }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ item.date_added | date:'MMM d' }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-right">
                  @if (auth.isCEO()) {
                    <app-ui-button variant="ghost" size="sm" (click)="onDelete(item)" className="text-red-600 hover:text-red-800">Delete</app-ui-button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (totalPages > 1) {
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500">Page {{ page }} of {{ totalPages }} ({{ total }} items)</p>
          <div class="flex gap-2">
            <app-ui-button variant="outline" size="sm" (click)="goTo(page - 1)" [disabled]="page <= 1">Prev</app-ui-button>
            <app-ui-button variant="outline" size="sm" (click)="goTo(page + 1)" [disabled]="page >= totalPages">Next</app-ui-button>
          </div>
        </div>
      }
    </div>
  `,
})
export class WardrobeListComponent implements OnInit {
  private api = inject(AdminApiService);
  protected auth = inject(AuthService);
  items: WardrobeItem[] = [];
  stats?: WardrobeStats;
  total = 0;
  page = 1;
  totalPages = 1;
  search = '';

  ngOnInit() {
    this.api.getWardrobeStats().subscribe((s) => (this.stats = s));
    this.loadItems();
  }

  private loadItems() {
    this.api.getWardrobeItems(this.search || undefined, this.page).subscribe((res) => {
      this.items = res.items;
      this.total = res.total;
      this.totalPages = res.totalPages;
    });
  }

  onSearch() {
    this.page = 1;
    this.loadItems();
  }

  goTo(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadItems();
  }

  onDelete(item: WardrobeItem) {
    if (!confirm(`Delete "${item.apparel_name}"?`)) return;
    this.api.deleteWardrobeItem(item.id).subscribe({
      next: () => this.loadItems(),
      error: () => alert('Failed to delete item'),
    });
  }
}
