export type RequestContext = {
  userId: string;
  tenantId: string;
  role: "owner" | "admin" | "operator" | "viewer";
};

export function getDemoRequestContext(): RequestContext {
  return {
    userId: process.env.DEMO_OWNER_USER_ID ?? "00000000-0000-0000-0000-000000000001",
    tenantId: process.env.DEMO_TENANT_ID ?? "10000000-0000-0000-0000-000000000001",
    role: "owner"
  };
}
