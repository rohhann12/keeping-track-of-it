export interface JWTPayload {
    userId: string;
    email: string;
    role: "USER" | "ADMIN";
}
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const generateToken: (payload: JWTPayload) => string;
export declare const verifyToken: (token: string) => JWTPayload;
//# sourceMappingURL=auth.d.ts.map