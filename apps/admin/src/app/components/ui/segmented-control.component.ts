import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-ui-segmented-control',
  standalone: true,
  template: `
    <div class="flex rounded-lg bg-gray-100 p-1">
      @for (opt of options(); track opt.value) {
        <button
          type="button"
          (click)="onChange.emit(opt.value)"
          class="flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          [class]="selected() === opt.value
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'"
        >
          {{ opt.label }}
        </button>
      }
    </div>
  `,
})
export class SegmentedControl {
  options = input<{ label: string; value: string }[]>([]);
  selected = input<string>();
  onChange = output<string>();
}
