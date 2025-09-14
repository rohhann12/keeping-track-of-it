import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export function decodeJwtToken(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token format');
    }
    
    const payload = JSON.parse(atob(parts[1]));
    return payload as JwtPayload;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

export function getRoleFromToken(token: string): string | null {
  const payload = decodeJwtToken(token);
  return payload?.role || null;
}
