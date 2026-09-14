import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || "fallback_secret_editorial_portfolio_system_key_2025";
const secretKey = new TextEncoder().encode(JWT_SECRET);
export const AUTH_COOKIE_NAME = "portfolio_admin_token";
export const USER_AUTH_COOKIE_NAME = "portfolio_user_token";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  username?: string;
  avatarUrl?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    username: user.username,
    avatarUrl: user.avatarUrl,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      username: payload.username as string | undefined,
      avatarUrl: payload.avatarUrl as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function getCurrentAdmin(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const user = await verifySessionToken(token);
  if (!user || (user.role !== "superadmin" && user.role !== "admin")) return null;
  return user;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(USER_AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

