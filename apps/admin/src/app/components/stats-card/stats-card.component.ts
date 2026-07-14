import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  template: `
    <div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <div class="flex items-center gap-4">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-lg"
          [class]="colorClass()"
        >
          <span class="material-icons text-xl">{{ icon() }}</span>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ label() }}</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ value() }}</p>
        </div>
      </div>
    </div>
  `,
})
export class StatsCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  icon = input<string>('');
  colorClass = input<string>('bg-indigo-50 text-indigo-600');
}
