export type OrgType = 'clinic' | 'school';

export interface User {
  id: string;
  fullName: string;
  email: string;
  orgType: OrgType;
  role?: 'user' | 'admin';
  businessName?: string;
  logoUrl?: string;
  isEmailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  orgType: OrgType;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}
