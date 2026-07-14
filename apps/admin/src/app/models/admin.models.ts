export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  useCelsius: boolean;
  darkMode: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    wardrobes: number;
    calendarEvents: number;
    devices: number;
  };
}

export interface UserDetail extends User {
  wardrobes: WardrobeItem[];
  calendarEvents: CalendarEvent[];
  devices: Device[];
}

export interface WardrobeItem {
  id: number;
  userId: number;
  apparel_name: string;
  photo: string | null;
  type: string;
  material: string;
  color: string;
  season: string;
  event: string;
  date_added: string;
  user?: { id: number; firstName: string; lastName: string; email: string };
}

export interface CalendarEvent {
  id: number;
  userId: number;
  title: string;
  type: string;
  time: string | null;
  from: string | null;
  to: string | null;
  dateKey: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: number; firstName: string; lastName: string; email: string };
}

export interface Device {
  id: number;
  userId: number;
  name: string;
  macAddress: string;
  batteryLevel: number | null;
  firmwareVersion: string;
  pairedAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalWardrobeItems: number;
  totalEvents: number;
  recentUsers: User[];
  recentItems: WardrobeItem[];
  recentEvents: CalendarEvent[];
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersResponse extends PaginatedResponse<User> {
  users: User[];
}

export interface WardrobeResponse extends PaginatedResponse<WardrobeItem> {
  items: WardrobeItem[];
}

export interface EventsResponse extends PaginatedResponse<CalendarEvent> {
  events: CalendarEvent[];
}

export interface WardrobeStats {
  totalItems: number;
  byType: { type: string; _count: number }[];
  byMaterial: { material: string; _count: number }[];
  byColor: { color: string; _count: number }[];
  bySeason: { season: string; _count: number }[];
}

export interface EventStats {
  totalEvents: number;
  uniqueUsers: number;
  byType: { type: string; _count: number }[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type AdminRole = 'CEO' | 'PROJECT_MANAGER' | 'SALES' | 'HR';

export interface AdminSettings {
  darkMode?: boolean;
  role?: AdminRole;
}
