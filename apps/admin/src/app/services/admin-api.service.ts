import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import type {
  DashboardStats, UsersResponse, UserDetail, WardrobeResponse,
  WardrobeStats, EventsResponse, EventStats,
} from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private apiBase = 'http://localhost:4000';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  private headers() {
    const token = this.auth.state()?.token;
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  getDashboardStats() {
    return this.http.get<DashboardStats>(`${this.apiBase}/admin/dashboard/stats`, {
      headers: this.headers(),
    });
  }

  getUsers(search?: string, page = 1, limit = 20) {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<UsersResponse>(`${this.apiBase}/admin/users`, {
      headers: this.headers(),
      params,
    });
  }

  getUserDetail(id: number) {
    return this.http.get<UserDetail>(`${this.apiBase}/admin/users/${id}`, {
      headers: this.headers(),
    });
  }

  deleteUser(id: number) {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiBase}/admin/users/${id}`,
      { headers: this.headers() },
    );
  }

  getWardrobeItems(search?: string, page = 1, limit = 20) {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<WardrobeResponse>(`${this.apiBase}/admin/wardrobe`, {
      headers: this.headers(),
      params,
    });
  }

  getWardrobeStats() {
    return this.http.get<WardrobeStats>(`${this.apiBase}/admin/wardrobe/stats`, {
      headers: this.headers(),
    });
  }

  deleteWardrobeItem(id: number) {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiBase}/admin/wardrobe/${id}`,
      { headers: this.headers() },
    );
  }

  getEvents(search?: string, page = 1, limit = 20) {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<EventsResponse>(`${this.apiBase}/admin/events`, {
      headers: this.headers(),
      params,
    });
  }

  getEventStats() {
    return this.http.get<EventStats>(`${this.apiBase}/admin/events/stats`, {
      headers: this.headers(),
    });
  }

  deleteEvent(id: number) {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiBase}/admin/events/${id}`,
      { headers: this.headers() },
    );
  }

  deleteAdminAccount() {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiBase}/admin/account`,
      { headers: this.headers() },
    );
  }

  updateSettings(data: { darkMode?: boolean; role?: string }) {
    return this.http.patch<any>(`${this.apiBase}/admin/settings`, data, {
      headers: this.headers(),
    });
  }
}
