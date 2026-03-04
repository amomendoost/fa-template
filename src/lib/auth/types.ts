export interface AuthUser {
  id: string;
  phone?: string;
  email?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token?: string;
  user: AuthUser;
  expires_at?: number;
}
