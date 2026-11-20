CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin','manager','staff','supplier')),
  status VARCHAR(20) NOT NULL DEFAULT 'Approved' CHECK (status IN ('Pending','Approved','Rejected')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
  token_hash CHAR(64) PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image VARCHAR(255)
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  buy_price INTEGER NOT NULL CHECK (buy_price >= 0),
  sell_price INTEGER NOT NULL CHECK (sell_price >= 0),
  min_stock INTEGER NOT NULL CHECK (min_stock >= 0),
  low_stock INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  unit VARCHAR(20) NOT NULL,
  shelf_location VARCHAR(50) NOT NULL,
  image VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (low_stock > min_stock)
);

CREATE VIEW products_view AS
SELECT p.*, c.name AS category_name,
  CASE WHEN p.stock = 0 THEN 'Out of Stock'
       WHEN p.stock <= p.min_stock THEN 'Severe'
       WHEN p.stock <= p.low_stock THEN 'Low'
       ELSE 'Normal' END AS stock_status
FROM products p JOIN categories c ON c.id = p.category_id;

CREATE TABLE restock_orders (
  id SERIAL PRIMARY KEY,
  po_number VARCHAR(30) GENERATED ALWAYS AS ('PO-' || LPAD(id::TEXT, 4, '0')) STORED UNIQUE,
  supplier_id INTEGER NOT NULL REFERENCES users(id),
  manager_id INTEGER NOT NULL REFERENCES users(id),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_date DATE NOT NULL,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Confirmed','Rejected','In Transit','Received')),
  status_note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (expected_date >= order_date),
  CHECK (status <> 'Rejected' OR LENGTH(TRIM(COALESCE(status_note, ''))) > 0)
);

CREATE TABLE restock_order_items (
  id SERIAL PRIMARY KEY,
  restock_order_id INTEGER NOT NULL REFERENCES restock_orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(150) NOT NULL,
  product_sku VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  trx_number VARCHAR(30) GENERATED ALWAYS AS ('TRX-' || LPAD(id::TEXT, 4, '0')) STORED UNIQUE,
  type VARCHAR(3) NOT NULL CHECK (type IN ('IN','OUT')),
  trx_date DATE NOT NULL DEFAULT CURRENT_DATE,
  restock_order_id INTEGER REFERENCES restock_orders(id),
  supplier_id INTEGER REFERENCES users(id),
  customer_name VARCHAR(150),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected','Shipped')),
  reject_reason TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (type <> 'IN' OR supplier_id IS NOT NULL),
  CHECK (type <> 'OUT' OR LENGTH(TRIM(COALESCE(customer_name, ''))) > 0),
  CHECK (status <> 'Shipped' OR type = 'OUT'),
  CHECK (restock_order_id IS NULL OR type = 'IN'),
  CHECK (status <> 'Rejected' OR LENGTH(TRIM(COALESCE(reject_reason, ''))) > 0)
);

CREATE UNIQUE INDEX uq_active_po ON transactions(restock_order_id) WHERE restock_order_id IS NOT NULL AND status <> 'Rejected';

CREATE TABLE transaction_items (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(150) NOT NULL,
  product_sku VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

INSERT INTO users (name, email, password, role, status) VALUES
('Admin', 'admin@warehouse.com', '$2b$10$o83vm2NPimyPNlpR0EidKOLBM70I1YOFNc2a79.PPKWvppjMubWhy', 'admin', 'Approved'),
('Manager', 'manager@warehouse.com', '$2b$10$o83vm2NPimyPNlpR0EidKOLBM70I1YOFNc2a79.PPKWvppjMubWhy', 'manager', 'Approved'),
('Staff', 'staff@warehouse.com', '$2b$10$o83vm2NPimyPNlpR0EidKOLBM70I1YOFNc2a79.PPKWvppjMubWhy', 'staff', 'Approved'),
('Supplier One', 'supplier@warehouse.com', '$2b$10$o83vm2NPimyPNlpR0EidKOLBM70I1YOFNc2a79.PPKWvppjMubWhy', 'supplier', 'Approved'),
('Supplier Pending', 'pending@warehouse.com', '$2b$10$o83vm2NPimyPNlpR0EidKOLBM70I1YOFNc2a79.PPKWvppjMubWhy', 'supplier', 'Pending');

INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Stationery', 'Office supplies'),
('Food', 'Packaged food and drinks'),
('Empty', 'Category without products');

INSERT INTO products (name, sku, category_id, description, buy_price, sell_price, min_stock, low_stock, stock, unit, shelf_location) VALUES
('Mechanical Keyboard', 'ELC-001', 1, 'Blue switch keyboard', 300000, 450000, 5, 15, 40, 'pcs', 'A-01'),
('Wireless Mouse', 'ELC-002', 1, '2.4GHz wireless mouse', 100000, 150000, 5, 15, 12, 'pcs', 'A-02'),
('Gaming Headset', 'ELC-003', 1, 'Headset with microphone', 200000, 300000, 5, 15, 3, 'pcs', 'A-03'),
('Black Pen', 'STN-001', 2, '0.5mm black ink pen', 2000, 3500, 20, 50, 0, 'box', 'B-01'),
('A4 Paper', 'STN-002', 2, '500 sheets per ream', 45000, 60000, 10, 30, 120, 'box', 'B-02'),
('Mineral Water', 'FOD-001', 3, '600ml bottled water', 2500, 4000, 50, 150, 400, 'pcs', 'C-01');