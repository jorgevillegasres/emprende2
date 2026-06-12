import type { Expense, Product, Sale, Supply } from "@emprendedos/domain";

export type TenantRecord = {
  tenantId: string;
};

export type ProductRecord = Product & TenantRecord;
export type SupplyRecord = Supply & TenantRecord & { id: string };
export type SaleRecord = Sale & TenantRecord;
export type ExpenseRecord = Expense & TenantRecord;
export type InventoryMovementRecord = TenantRecord & {
  id: string;
  itemType: "product" | "supply";
  itemId: string;
  movementType: "sale" | "production" | "adjustment" | "purchase";
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  referenceType: string;
  referenceId: string;
  note?: string;
  createdAt?: string;
};
export type RecipeIngredientRecord = {
  supplyId: string;
  quantity: number;
};
export type RecipeRecord = TenantRecord & {
  id: string;
  productId: string;
  name: string;
  outputQuantity: number;
  ingredients: RecipeIngredientRecord[];
  note?: string;
  createdAt?: string;
};
export type ProductionOrderRecord = TenantRecord & {
  id: string;
  productId: string;
  quantity: number;
  totalCost: number;
  unitCost: number;
  recipeId?: string | null;
  note?: string;
  createdAt?: string;
};

export type AuthIdentityRecord = {
  userId: string;
  userName?: string;
  email: string;
  passwordHash: string;
  tenantId: string;
  tenantName?: string;
  tenantSlug?: string;
  businessType?: string;
  country?: string;
  currency?: string;
  role: "owner" | "admin" | "operator" | "viewer";
};

export type TenantRepository<TRecord extends TenantRecord> = {
  insert(record: TRecord): Promise<TRecord>;
  listByTenant(tenantId: string): Promise<TRecord[]>;
};

export type ProductRepository = TenantRepository<ProductRecord> & {
  findByTenantAndId(tenantId: string, id: string): Promise<ProductRecord | null>;
  updateStock(tenantId: string, id: string, stock: number): Promise<ProductRecord | null>;
  updateStockAndUnitCost(tenantId: string, id: string, stock: number, unitCost: number): Promise<ProductRecord | null>;
};

export type SupplyRepository = TenantRepository<SupplyRecord> & {
  findByTenantAndId(tenantId: string, id: string): Promise<SupplyRecord | null>;
  updateStockAndAverageCost(tenantId: string, id: string, stock: number, averageCost: number): Promise<SupplyRecord | null>;
};

export type AuthRepository = {
  insert(record: AuthIdentityRecord): Promise<AuthIdentityRecord>;
  findByEmail(email: string): Promise<AuthIdentityRecord | null>;
  registerOwner(record: AuthIdentityRecord): Promise<AuthIdentityRecord>;
};

export type RecipeRepository = TenantRepository<RecipeRecord> & {
  findByTenantAndId(tenantId: string, id: string): Promise<RecipeRecord | null>;
};
export type ProductionOrderRepository = TenantRepository<ProductionOrderRecord>;

export type Repositories = {
  auth: AuthRepository;
  products: ProductRepository;
  supplies: SupplyRepository;
  sales: TenantRepository<SaleRecord>;
  expenses: TenantRepository<ExpenseRecord>;
  inventoryMovements: TenantRepository<InventoryMovementRecord>;
  recipes: RecipeRepository;
  productionOrders: ProductionOrderRepository;
};

export function createInMemoryRepositories(): Repositories {
  const products: ProductRecord[] = [];
  const supplies: SupplyRecord[] = [];
  const sales: SaleRecord[] = [];
  const expenses: ExpenseRecord[] = [];
  const inventoryMovements: InventoryMovementRecord[] = [];
  const recipes: RecipeRecord[] = [];
  const productionOrders: ProductionOrderRecord[] = [];
  const authIdentities: AuthIdentityRecord[] = [];

  return {
    auth: createAuthRepository(authIdentities),
    supplies: createSupplyRepository(supplies),
    sales: createTenantRepository(sales),
    expenses: createTenantRepository(expenses),
    inventoryMovements: createTenantRepository(inventoryMovements),
    recipes: createRecipeRepository(recipes),
    productionOrders: createTenantRepository(productionOrders),
    products: createProductRepository(products)
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

function createRecipeRepository(records: RecipeRecord[]): RecipeRepository {
  return {
    async insert(record: RecipeRecord) {
      const stored = { ...record, ingredients: record.ingredients.map((ingredient) => ({ ...ingredient })) };
      records.push(stored);
      return stored;
    },
    async listByTenant(tenantId: string) {
      return records.filter((record) => record.tenantId === tenantId).map((record) => ({
        ...record,
        ingredients: record.ingredients.map((ingredient) => ({ ...ingredient }))
      }));
    },
    async findByTenantAndId(tenantId: string, id: string) {
      const record = records.find((recipe) => recipe.tenantId === tenantId && recipe.id === id);
      if (!record) return null;
      return {
        ...record,
        ingredients: record.ingredients.map((ingredient) => ({ ...ingredient }))
      };
    }
  };
}

function createSupplyRepository(records: SupplyRecord[]): SupplyRepository {
  return {
    ...createTenantRepository(records),
    async findByTenantAndId(tenantId: string, id: string) {
      return records.find((record) => record.tenantId === tenantId && record.id === id) ?? null;
    },
    async updateStockAndAverageCost(tenantId: string, id: string, stock: number, averageCost: number) {
      const record = records.find((supply) => supply.tenantId === tenantId && supply.id === id);
      if (!record) return null;
      record.stock = stock;
      record.averageCost = averageCost;
      return record;
    }
  };
}

function createProductRepository(records: ProductRecord[]): ProductRepository {
  return {
    ...createTenantRepository(records),
    async findByTenantAndId(tenantId: string, id: string) {
      return records.find((record) => record.tenantId === tenantId && record.id === id) ?? null;
    },
    async updateStock(tenantId: string, id: string, stock: number) {
      const record = records.find((product) => product.tenantId === tenantId && product.id === id);
      if (!record) return null;
      record.stock = stock;
      return record;
    },
    async updateStockAndUnitCost(tenantId: string, id: string, stock: number, unitCost: number) {
      const record = records.find((product) => product.tenantId === tenantId && product.id === id);
      if (!record) return null;
      record.stock = stock;
      record.unitCost = unitCost;
      return record;
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
    },
    async registerOwner(record: AuthIdentityRecord) {
      const exists = records.some((existing) => existing.email.toLowerCase() === record.email.toLowerCase());
      if (exists) throw new Error("Email already registered");
      records.push(record);
      return record;
    }
  };
}
