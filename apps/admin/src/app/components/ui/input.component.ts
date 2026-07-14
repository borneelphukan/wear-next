import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ui-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div>
      @if (label()) {
        <label class="mb-1 block text-sm font-medium text-gray-700">{{ label() }}</label>
      }
      <div class="relative">
        <input
          [type]="type() === 'password' ? (showPassword ? 'text' : 'password') : type()"
          [ngModel]="value()"
          (ngModelChange)="value.set($event)"
          [name]="name()"
          [required]="required()"
          [placeholder]="placeholder()"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          [class]="type() === 'password' ? 'pr-10 ' + className() : className()"
        />
        @if (type() === 'password') {
          <button
            type="button"
            tabindex="-1"
            (click)="showPassword = !showPassword"
            class="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-400 hover:text-gray-600"
          >
            @if (showPassword) {
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              </svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            }
          </button>
        }
      </div>
    </div>
  `,
})
export class Input {
  type = input<string>('text');
  label = input<string>();
  name = input<string>('');
  placeholder = input<string>('');
  required = input(false);
  className = input('');
  value = model('');
  showPassword = false;
}
