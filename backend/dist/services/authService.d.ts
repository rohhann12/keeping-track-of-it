import { AuthResponse, SigninData, SignupData } from '../types/auth';
export declare class AuthService {
    signup(data: SignupData): Promise<AuthResponse>;
    signin(data: SigninData): Promise<AuthResponse>;
}
//# sourceMappingURL=authService.d.ts.map