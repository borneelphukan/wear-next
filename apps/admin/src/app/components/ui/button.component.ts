import { Component, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'success' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'md' | 'sm' | 'lg';
export type ButtonShape = 'default' | 'circle';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  template: `
    <button
      [disabled]="disabled() || loading()"
      class="inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
      [class]="[variantClass(), sizeClass(), shapeClass(), className()]"
    >
      @if (loading()) {
        <svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      }
      <ng-content />
    </button>
  `,
})
export class Button {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  shape = input<ButtonShape>('default');
  loading = input(false);
  disabled = input(false);
  className = input('');

  variantClass() {
    const map: Record<ButtonVariant, string> = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500',
      success: 'bg-green-600 text-white hover:bg-green-500 focus:ring-green-500',
      destructive: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-500 focus:ring-gray-500',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-indigo-500',
      link: 'bg-transparent text-indigo-600 underline hover:text-indigo-500 focus:ring-indigo-500 p-0',
    };
    return map[this.variant()] || map.primary;
  }

  sizeClass() {
    const map: Record<ButtonSize, string> = {
      md: 'px-6 py-3 text-base rounded-xl',
      sm: 'px-4 py-2 text-sm rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-xl',
    };
    return map[this.size()] || map.md;
  }

  shapeClass() {
    return this.shape() === 'circle' ? 'rounded-full aspect-square' : '';
  }
}
