import { getConfig } from "../config.js";
import { verifyAuthToken } from "./tokens.js";

export type RequestContext = {
  userId: string;
  tenantId: string;
  role: "owner" | "admin" | "operator" | "viewer";
  superAdmin?: boolean;
};

export function isSuperAdminEmail(email: string): boolean {
  return getConfig().superAdminEmails.includes(email.trim().toLowerCase());
}

export function requireSuperAdmin(headers: RequestHeaders): RequestContext {
  const context = resolveRequestContext(headers);
  if (!context.superAdmin) throw new Error("Forbidden");
  return context;
}

type HeaderValue = string | string[] | undefined;
type RequestHeaders = Record<string, HeaderValue>;

export function getDemoRequestContext(): RequestContext {
  return {
    userId: process.env.DEMO_OWNER_USER_ID ?? "00000000-0000-0000-0000-000000000001",
    tenantId: process.env.DEMO_TENANT_ID ?? "10000000-0000-0000-0000-000000000001",
    role: "owner"
  };
}

export function resolveRequestContext(headers: RequestHeaders, options?: { allowDevelopmentContext?: boolean }): RequestContext {
  const tokenContext = resolveBearerContext(headers);
  if (tokenContext) return tokenContext;

  const allowDevelopmentContext = options?.allowDevelopmentContext ?? getConfig().allowDevelopmentRequestContext;
  if (!allowDevelopmentContext) {
    throw new Error("Authentication required");
  }

  const demo = getDemoRequestContext();
  return {
    userId: readHeader(headers, "x-emprendedos-user-id") ?? demo.userId,
    tenantId: readHeader(headers, "x-emprendedos-tenant-id") ?? demo.tenantId,
    role: resolveRole(readHeader(headers, "x-emprendedos-role")) ?? demo.role
  };
}

export function resolveBearerContext(headers: RequestHeaders): RequestContext | null {
  const authorization = readHeader(headers, "authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  return verifyAuthToken(authorization.slice("Bearer ".length), { secret: getConfig().authSecret });
}

function readHeader(headers: RequestHeaders, name: string) {
  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return value;
}

function resolveRole(value: string | undefined): RequestContext["role"] | undefined {
  if (value === "owner" || value === "admin" || value === "operator" || value === "viewer") return value;
  return undefined;
}
