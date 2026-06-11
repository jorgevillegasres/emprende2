import { createHmac, timingSafeEqual } from "node:crypto";
import type { RequestContext } from "./context.js";

type TokenPayload = RequestContext & {
  exp: number;
};

type TokenOptions = {
  secret: string;
  now?: number;
  expiresInSeconds?: number;
};

export function signAuthToken(context: RequestContext, options: TokenOptions) {
  const now = options.now ?? Math.floor(Date.now() / 1000);
  const expiresInSeconds = options.expiresInSeconds ?? 60 * 60 * 8;
  const payload: TokenPayload = { ...context, exp: now + expiresInSeconds };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload, options.secret);
  return `${encodedPayload}.${signature}`;
}

export function verifyAuthToken(token: string, options: TokenOptions): RequestContext | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;
  const expectedSignature = sign(encodedPayload, options.secret);
  if (!safeEqual(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as TokenPayload;
    const now = options.now ?? Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;
    if (!isRole(payload.role) || !payload.userId || !payload.tenantId) return null;
    return { userId: payload.userId, tenantId: payload.tenantId, role: payload.role };
  } catch {
    return null;
  }
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function isRole(value: string): value is RequestContext["role"] {
  return value === "owner" || value === "admin" || value === "operator" || value === "viewer";
}
