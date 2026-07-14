import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Button } from '../../components/ui/button.component';
import { SegmentedControl } from '../../components/ui/segmented-control.component';
import { Input } from '../../components/ui/input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, Button, SegmentedControl, Input],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div class="w-full max-w-sm">
        <div class="mb-8 text-center">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">WearNext</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Admin Panel</p>
        </div>

        <div class="mb-6">
          <app-ui-segmented-control
            [options]="tabs"
            [selected]="tab"
            (onChange)="tab = $event"
          />
        </div>

        @if (tab === 'login') {
          <form (ngSubmit)="onLogin()" class="rounded-lg bg-white p-8 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <div class="mb-5">
              <app-ui-input
                label="Email"
                type="email"
                name="email"
                [value]="email"
                (valueChange)="email = $event"
                placeholder="admin@wearnext.com"
                [required]="true"
              />
            </div>
            <div class="mb-6">
              <app-ui-input
                type="password"
                label="Password"
                name="password"
                [value]="password"
                (valueChange)="password = $event"
              />
            </div>
            @if (error) {
              <p class="mb-4 text-sm text-red-600">{{ error }}</p>
            }
            <div class="flex justify-center">
              <app-ui-button
                type="submit"
                variant="primary"
                [loading]="loading"
                [disabled]="loading"
              >
                {{ loading ? 'Signing in…' : 'Sign in' }}
              </app-ui-button>
            </div>
          </form>
        }

        @if (tab === 'register') {
          <form (ngSubmit)="onRegister()" class="rounded-lg bg-white p-8 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
            <div class="mb-4 grid grid-cols-2 gap-3">
              <app-ui-input
                label="First Name"
                type="text"
                name="firstName"
                [value]="firstName"
                (valueChange)="firstName = $event"
                [required]="true"
              />
              <app-ui-input
                label="Last Name"
                type="text"
                name="lastName"
                [value]="lastName"
                (valueChange)="lastName = $event"
                [required]="true"
              />
            </div>
            <div class="mb-4">
              <app-ui-input
                label="Email"
                type="email"
                name="regEmail"
                [value]="email"
                (valueChange)="email = $event"
                placeholder="admin@wearnext.com"
                [required]="true"
              />
            </div>
            <div class="mb-3">
              <app-ui-input
                type="password"
                label="Password"
                name="regPassword"
                [value]="password"
                (valueChange)="password = $event"
              />
            </div>
            <div class="mb-6">
              <app-ui-input
                type="password"
                label="Confirm Password"
                name="confirmPassword"
                [value]="confirmPassword"
                (valueChange)="confirmPassword = $event"
              />
            </div>
            @if (error) {
              <p class="mb-4 text-sm text-red-600">{{ error }}</p>
            }
            @if (registerSuccess) {
              <p class="mb-4 text-sm text-green-600">Admin account created! You can now sign in.</p>
            }
            <div class="flex justify-center">
              <app-ui-button
                type="submit"
                variant="primary"
                [loading]="loading"
                [disabled]="loading"
              >
                {{ loading ? 'Creating…' : 'Create Admin Account' }}
              </app-ui-button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  tabs = [
    { label: 'Sign In', value: 'login' },
    { label: 'Create Admin', value: 'register' },
  ];
  tab: string = 'login';
  email = '';
  password = '';
  confirmPassword = '';
  firstName = '';
  lastName = '';
  error = '';
  loading = false;
  registerSuccess = false;

  onLogin() {
    this.error = '';
    this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || err.message || 'Login failed';
      },
    });
  }

  onRegister() {
    this.error = '';
    this.registerSuccess = false;
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }
    this.loading = true;
    this.http
      .post('http://localhost:4000/admin/auth/register', {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.registerSuccess = true;
          this.firstName = '';
          this.lastName = '';
          this.email = '';
          this.password = '';
          this.confirmPassword = '';
          this.tab = 'login';
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || err.message || 'Registration failed';
        },
      });
  }
}
