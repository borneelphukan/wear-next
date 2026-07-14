import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AdminApiService } from '../../services/admin-api.service';
import type { UserDetail } from '../../models/admin.models';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (user) {
      <div class="space-y-8">
        <button (click)="router.navigate(['/users'])" class="text-sm text-indigo-600 hover:text-indigo-800">
          &larr; Back to users
        </button>

        <div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ user.firstName }} {{ user.lastName }}</h2>
              <p class="text-sm text-gray-500">{{ user.email }}</p>
            </div>
          </div>
          <div class="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div><span class="text-gray-500">Phone:</span> {{ user.phone || '—' }}</div>
            <div><span class="text-gray-500">Celsius:</span> {{ user.useCelsius ? 'Yes' : 'No' }}</div>
            <div><span class="text-gray-500">Dark Mode:</span> {{ user.darkMode ? 'Yes' : 'No' }}</div>
            <div><span class="text-gray-500">Joined:</span> {{ user.createdAt | date:'MMM d, y' }}</div>
            <div><span class="text-gray-500">Wardrobe:</span> {{ user.wardrobes.length }} items</div>
            <div><span class="text-gray-500">Events:</span> {{ user.calendarEvents.length }} events</div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Wardrobe ({{ user.wardrobes.length }})</h3>
            <div class="space-y-2">
              @for (item of user.wardrobes.slice(0, 10); track item.id) {
                <div class="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
                  <span class="font-medium text-gray-900">{{ item.apparel_name }}</span>
                  <span class="text-xs text-gray-500">{{ item.type }} · {{ item.color }}</span>
                </div>
              }
            </div>
          </section>

          <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Events ({{ user.calendarEvents.length }})</h3>
            <div class="space-y-2">
              @for (e of user.calendarEvents.slice(0, 10); track e.id) {
                <div class="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
                  <span class="font-medium text-gray-900">{{ e.title }}</span>
                  <span class="text-xs text-gray-500">{{ e.type }} · {{ e.dateKey }}</span>
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
export class UserDetailComponent implements OnInit {
  private api = inject(AdminApiService);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  user?: UserDetail;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getUserDetail(id).subscribe((u) => (this.user = u));
  }
}
