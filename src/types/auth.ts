export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  // DummyJSON returns `accessToken` (older docs used `token`).
  // authService.login normalizes both shapes into `token`.
  token: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthState {
  user: LoginResponse | null;
  token: string | null;
  isAuthenticated: boolean;
}