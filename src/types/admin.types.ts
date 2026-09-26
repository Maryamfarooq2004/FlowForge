// Frontend mirror of the admin data API (server/src/services/admin.service.ts).

export interface AdminStats {
  users: { total: number; admins: number; clinics: number; schools: number; newThisWeek: number };
  projects: { total: number; archived: number; byStatus: Record<string, number> };
  generations: { total: number; completed: number; failed: number; running: number; avgDurationMs: number };
  deployments: { exported: number; live: number };
  notifications: { sent: number; failed: number };
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  organizationType: 'clinic' | 'school';
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  projectCount: number;
}

export interface AdminUsersResult {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminDeployment {
  id: string;
  projectName: string;
  domain?: 'clinic' | 'school';
  status: 'none' | 'exported' | 'live';
  exportCount: number;
  liveUrl?: string;
  lastExportAt?: string;
  ownerEmail?: string;
  updatedAt: string;
}

export interface AdminActivity {
  id: string;
  action: string;
  email?: string;
  projectId?: string;
  ip?: string;
  createdAt: string;
}

export interface AdminUsage {
  actionCounts: { action: string; count: number }[];
  daily: { date: string; count: number }[];
  generations: { completed: number; failed: number; avgDurationMs: number };
  emails: { sent: number; failed: number };
  aiTracked: boolean;
}
