/** Answer of the admin login (see TokenService.java). */
export interface LoginResponse {
  token: string;
  expiresAt: string;
}

/** The logged-in admin, as the dashboard remembers it between page loads. */
export interface Session {
  token: string;
  expiresAt: string;
  username: string;
}
