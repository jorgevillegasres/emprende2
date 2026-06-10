import type { Product } from "@emprendedos/domain";

export type TenantRecord = {
  tenantId: string;
};

export type ProductRecord = Product & TenantRecord;

export function createInMemoryRepositories() {
  const products: ProductRecord[] = [];

  return {
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
