import type { Expense, Product, Sale, Supply } from "@emprendedos/domain";

export type TenantRecord = {
  tenantId: string;
};

export type ProductRecord = Product & TenantRecord;
export type SupplyRecord = Supply & TenantRecord & { id: string };
export type SaleRecord = Sale & TenantRecord;
export type ExpenseRecord = Expense & TenantRecord;

export type AuthIdentityRecord = {
  userId: string;
  email: string;
  passwordHash: string;
  tenantId: string;
  role: "owner" | "admin" | "operator" | "viewer";
};

export type TenantRepository<TRecord extends TenantRecord> = {
  insert(record: TRecord): Promise<TRecord>;
  listByTenant(tenantId: string): Promise<TRecord[]>;
};

export type AuthRepository = {
  insert(record: AuthIdentityRecord): Promise<AuthIdentityRecord>;
  findByEmail(email: string): Promise<AuthIdentityRecord | null>;
};

export type Repositories = {
  auth: AuthRepository;
  products: TenantRepository<ProductRecord>;
  supplies: TenantRepository<SupplyRecord>;
  sales: TenantRepository<SaleRecord>;
  expenses: TenantRepository<ExpenseRecord>;
};

export function createInMemoryRepositories(): Repositories {
  const products: ProductRecord[] = [];
  const supplies: SupplyRecord[] = [];
  const sales: SaleRecord[] = [];
  const expenses: ExpenseRecord[] = [];
  const authIdentities: AuthIdentityRecord[] = [];

  return {
    auth: createAuthRepository(authIdentities),
    supplies: createTenantRepository(supplies),
    sales: createTenantRepository(sales),
    expenses: createTenantRepository(expenses),
    products: createTenantRepository(products)
  };
}

function createTenantRepository<TRecord extends TenantRecord>(records: TRecord[]): TenantRepository<TRecord> {
  return {
    async insert(record: TRecord) {
      records.push(record);
      return record;
    },
    async listByTenant(tenantId: string) {
      return records.filter((record) => record.tenantId === tenantId);
    }
  };
}

function createAuthRepository(records: AuthIdentityRecord[]): AuthRepository {
  return {
    async insert(record: AuthIdentityRecord) {
      records.push(record);
      return record;
    },
    async findByEmail(email: string) {
      return records.find((record) => record.email.toLowerCase() === email.toLowerCase()) ?? null;
    }
  };
}
