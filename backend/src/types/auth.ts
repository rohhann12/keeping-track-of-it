export interface SignupData {
    email: string;
    password: string;
    role?: string;
  }
  
  export interface SigninData {
    email: string;
    password: string;
  }
  
  export interface UserResponse {
    id: string;
    email: string;
    role: string;
  }
  
  export interface AuthResponse {
    message: string;
    user: UserResponse;
    token: string;
  }
  