import { apiRequest } from "./client";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
}

interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

interface RegisterResponse {
  success: boolean;
  data: User;
}

export async function login(
  input: LoginInput
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function register(
  input: RegisterInput
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}