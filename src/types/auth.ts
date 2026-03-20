export interface User {
  id: number;
  name: string;
  email: string;
  // add any other fields returned by /auth/me
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