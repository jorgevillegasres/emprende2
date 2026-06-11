export type RequestContext = {
  userId: string;
  tenantId: string;
  role: "owner" | "admin" | "operator" | "viewer";
};

type HeaderValue = string | string[] | undefined;
type RequestHeaders = Record<string, HeaderValue>;

export function getDemoRequestContext(): RequestContext {
  return {
    userId: process.env.DEMO_OWNER_USER_ID ?? "00000000-0000-0000-0000-000000000001",
    tenantId: process.env.DEMO_TENANT_ID ?? "10000000-0000-0000-0000-000000000001",
    role: "owner"
  };
}

export function resolveRequestContext(headers: RequestHeaders): RequestContext {
  const demo = getDemoRequestContext();

  return {
    userId: readHeader(headers, "x-emprendedos-user-id") ?? demo.userId,
    tenantId: readHeader(headers, "x-emprendedos-tenant-id") ?? demo.tenantId,
    role: resolveRole(readHeader(headers, "x-emprendedos-role")) ?? demo.role
  };
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
