/**
 * Auth client. SECURITY RULES:
 *  - Passwords and tokens are NEVER written to localStorage/sessionStorage or kept in module state.
 *  - Backend mode expects an httpOnly, Secure, SameSite cookie session set by the backend (credentials: "include").
 *  - Demo mode is NOT authentication: every call resolves with { user: null, demo: true } and nobody is signed in.
 */
import { API_MODE } from "./config";
import { apiRequest } from "./client";
import { endpoints } from "./endpoints";
import type { LoginRequest, RegisterRequest, SessionDTO } from "./types";

const demoResult = (): SessionDTO => ({ user: null, demo: true });

export async function login(body: LoginRequest): Promise<SessionDTO> {
  if (API_MODE === "demo") return demoResult();
  return (await apiRequest<SessionDTO>(endpoints.auth.login, { method: "POST", body, credentials: true })).data;
}
export async function register(body: RegisterRequest): Promise<SessionDTO> {
  if (API_MODE === "demo") return demoResult();
  return (await apiRequest<SessionDTO>(endpoints.auth.register, { method: "POST", body, credentials: true })).data;
}
export async function getSession(): Promise<SessionDTO> {
  if (API_MODE === "demo") return demoResult();
  return (await apiRequest<SessionDTO>(endpoints.auth.session, { credentials: true })).data;
}
export async function logout(): Promise<void> {
  if (API_MODE === "demo") return;
  await apiRequest<null>(endpoints.auth.logout, { method: "POST", credentials: true });
}
export async function forgotPassword(email: string): Promise<{ demo: boolean }> {
  if (API_MODE === "demo") return { demo: true };
  await apiRequest<null>(endpoints.auth.forgotPassword, { method: "POST", body: { email } });
  return { demo: false };
}
export async function resetPassword(token: string, password: string): Promise<{ demo: boolean }> {
  if (API_MODE === "demo") return { demo: true };
  await apiRequest<null>(endpoints.auth.resetPassword, { method: "POST", body: { token, password } });
  return { demo: false };
}
