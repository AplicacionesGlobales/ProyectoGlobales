// services/index.ts

// Dashboard services
export { clientDashboardService } from './clientDashboard.service';
export type { DashboardData, DashboardStats, RecentAppointment } from './clientDashboard.service';

// Auth services
export { authService } from './authService';

// API endpoints and types (re-exported for convenience)
export * from '../api/endpoints';
export * from '../api/types';