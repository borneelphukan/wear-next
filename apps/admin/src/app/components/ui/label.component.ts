import { Component } from '@angular/core';

@Component({
  selector: 'app-ui-label',
  standalone: true,
  template: `<span class="text-sm font-medium leading-none text-gray-900"><ng-content /></span>`,
})
export class Label {}
