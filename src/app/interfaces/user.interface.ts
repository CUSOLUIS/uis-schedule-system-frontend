import { Role } from '../services/role.service';

export interface UserRole {
  id: string;
  name: string;
  color: string;
  backgroundColor: string;
}

export interface MenuItem {
  icon: string;
  label: string;
  route: string;
  visible: boolean;
  description?: string;
}

export interface User {
  id: string;
  username: string;
  role: Role;
  fullName: string;
  email: string;
}

export interface LoginUser {
  id: string;
  username: string;
  password: string;
  role: string;
  fullName: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
  token?: string;
  refreshToken?: string;
}
