export interface User {
  id: number;
  name: string;
  email: string;
  role?: "admin" | "student" | string;
  email_verified_at?: string | null;
  is_active?: boolean;
  created_at?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}
