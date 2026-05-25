export interface RegisterDto {
  userName: string;
  email:    string;
  password: string;
}

export interface LoginDto {
  email:    string;
  password: string;
}

export interface AuthResponse {
  token?:   string;   cd
  userName: string;
  email:    string;
}
