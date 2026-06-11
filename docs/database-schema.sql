CREATE TABLE tenants (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  business_type text NOT NULL,
  country text NOT NULL,
  currency text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE memberships (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  user_id uuid NOT NULL REFERENCES users(id),
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'operator', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);

CREATE TABLE products (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  unit text NOT NULL DEFAULT 'un',
  stock numeric(12, 2) NOT NULL DEFAULT 0,
  min_stock numeric(12, 2) NOT NULL DEFAULT 0,
  unit_cost numeric(14, 2) NOT NULL DEFAULT 0,
  price numeric(14, 2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_tenant_id_idx ON products(tenant_id);

CREATE TABLE supplies (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  unit text NOT NULL DEFAULT 'un',
  stock numeric(12, 2) NOT NULL DEFAULT 0,
  min_stock numeric(12, 2) NOT NULL DEFAULT 0,
  average_cost numeric(14, 2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX supplies_tenant_id_idx ON supplies(tenant_id);

CREATE TABLE sales (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  product_id uuid NOT NULL REFERENCES products(id),
  date date NOT NULL,
  quantity numeric(12, 2) NOT NULL,
  unit_price numeric(14, 2) NOT NULL,
  unit_cost numeric(14, 2) NOT NULL,
  revenue numeric(14, 2) NOT NULL,
  cost numeric(14, 2) NOT NULL,
  gross_profit numeric(14, 2) NOT NULL,
  channel text NOT NULL,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sales_tenant_date_idx ON sales(tenant_id, date);

CREATE TABLE expenses (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  date date NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  amount numeric(14, 2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX expenses_tenant_date_idx ON expenses(tenant_id, date);

CREATE TABLE inventory_movements (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  item_type text NOT NULL,
  item_id text NOT NULL,
  movement_type text NOT NULL,
  quantity numeric(12, 2) NOT NULL,
  stock_before numeric(12, 2) NOT NULL,
  stock_after numeric(12, 2) NOT NULL,
  reference_type text NOT NULL,
  reference_id text NOT NULL,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX inventory_movements_tenant_item_idx ON inventory_movements(tenant_id, item_type, item_id);
CREATE INDEX inventory_movements_tenant_created_idx ON inventory_movements(tenant_id, created_at);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_products_policy ON products
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_supplies_policy ON supplies
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_sales_policy ON sales
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_expenses_policy ON expenses
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_inventory_movements_policy ON inventory_movements
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));
