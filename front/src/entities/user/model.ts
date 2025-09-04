import { Address } from '../order/model';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  role?: 'owner' | 'admin' | 'manager' | 'editor' | 'viewer' | 'user';
  permissions?: string[];
  preferences: UserPreferences;
  addresses: Address[];
  defaultShippingAddress?: string;
  defaultBillingAddress?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  dateCreated: string;
  dateModified: string;
  lastLogin?: string;
}

export interface UserPreferences {
  language: string;
  currency: string;
  theme: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptTerms: boolean;
  acceptMarketing?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  preferences?: Partial<UserPreferences>;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
