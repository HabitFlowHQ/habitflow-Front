export interface RegisterDto {
  userName: string;
  email:    string;
  password: string;
}

export interface LoginDto {
  usernameOrEmail: string;
  password: string;
}

export interface AuthResponse {
  token?:   string;
  userName: string;
  email:    string;
  isPremium?: boolean;
}

