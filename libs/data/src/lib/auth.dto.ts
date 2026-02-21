import { Role } from './enums';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserView {
  id: string;
  email: string;
  role: Role;
  organizationId: string;
}

export interface LoginResponse {
  accessToken: string;
  user: UserView;
}
