import type { Expense, Product, Sale, Supply } from "@emprendedos/domain";

export type TenantRecord = {
  tenantId: string;
};

export type ProductRecord = Product & TenantRecord;
export type SupplyRecord = Supply & TenantRecord;
export type SaleRecord = Sale & TenantRecord;
export type ExpenseRecord = Expense & TenantRecord;

export function createInMemoryRepositories() {
  const products: ProductRecord[] = [];
  const supplies: SupplyRecord[] = [];
  const sales: SaleRecord[] = [];
  const expenses: ExpenseRecord[] = [];

  return {
    supplies: createTenantRepository(supplies),
    sales: createTenantRepository(sales),
    expenses: createTenantRepository(expenses),
    products: {
      async insert(product: ProductRecord) {
        products.push(product);
        return product;
      },
      async listByTenant(tenantId: string) {
        return products.filter((product) => product.tenantId === tenantId);
      }
    }
  };
}

function createTenantRepository<TRecord extends TenantRecord>(records: TRecord[]) {
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
