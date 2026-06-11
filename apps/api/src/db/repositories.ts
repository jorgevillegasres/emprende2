import type { Expense, Product, Sale, Supply } from "@emprendedos/domain";

export type TenantRecord = {
  tenantId: string;
};

export type ProductRecord = Product & TenantRecord;
export type SupplyRecord = Supply & TenantRecord & { id: string };
export type SaleRecord = Sale & TenantRecord;
export type ExpenseRecord = Expense & TenantRecord;

export type TenantRepository<TRecord extends TenantRecord> = {
  insert(record: TRecord): Promise<TRecord>;
  listByTenant(tenantId: string): Promise<TRecord[]>;
};

export type Repositories = {
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

  return {
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
