import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LayoutComponent } from './components/layout/layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LayoutComponent],
  template: `
    @if (auth.isAuthenticated()) {
      <app-layout />
    } @else {
      <router-outlet />
    }
  `,
})
export class AppComponent {
  auth = inject(AuthService);
}
