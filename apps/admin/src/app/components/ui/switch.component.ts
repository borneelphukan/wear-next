import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'app-ui-switch',
  standalone: true,
  template: `
    <div class="flex w-full items-center justify-between">
      @if (label()) {
        <label class="flex-1 pr-4">
          <span class="text-sm font-bold text-gray-900">{{ label() }}</span>
        </label>
      }
      <button
        type="button"
        role="switch"
        [attr.aria-checked]="checked()"
        [disabled]="disabled()"
        (click)="toggle()"
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        [class]="checked() ? 'bg-indigo-600' : 'bg-gray-300'"
      >
        <span
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200"
          [class]="checked() ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
    </div>
    @if (hint() && !error()) {
      <p class="mt-1 text-xs font-normal text-gray-500">{{ hint() }}</p>
    }
    @if (error()) {
      <p class="mt-1 text-xs font-medium text-red-500">{{ error() }}</p>
    }
  `,
})
export class Switch {
  label = input<string>();
  hint = input<string>();
  error = input<string>();
  disabled = input(false);
  checked = model(false);
  onChange = output<boolean>();

  toggle() {
    if (this.disabled()) return;
    this.checked.set(!this.checked());
    this.onChange.emit(this.checked());
  }
}
