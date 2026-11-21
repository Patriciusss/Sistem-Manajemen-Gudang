const IMAGE_PATH = /^\/uploads\/[\w-]+\.(jpg|png|webp)$/;
const MAX_INT = 1_000_000_000;

const text = (value, max) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed && trimmed.length <= max ? trimmed : null;
};

const int = (value, min = 0) => {
  if (typeof value === "string" && value.trim() === "") return null;
  if (typeof value !== "number" && typeof value !== "string") return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= MAX_INT ? number : null;
};

export function validateCategory(body) {
  const errors = {};
  const name = text(body.name, 100);
  if (!name) errors.name = "Name is required (max 100 characters)";
  if (body.image && !IMAGE_PATH.test(body.image)) errors.image = "Invalid image path";
  return {
    errors,
    data: {
      name,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      image: body.image || null,
    },
  };
}

export function validateProduct(body, { creating = false } = {}) {
  const errors = {};
  const data = {};
  const set = (key, value, message) => {
    data[key] = value;
    if (value === null) errors[key] = message;
  };

  set("name", text(body.name, 150), "Name is required (max 150 characters)");
  if (creating) set("sku", text(body.sku, 50), "SKU is required (max 50 characters)");
  set("category_id", int(body.category_id, 1), "Category is required");
  set("description", text(body.description, 5000), "Description is required");
  set("buy_price", int(body.buy_price), "Buy price must be a whole number of 0 or more");
  set("sell_price", int(body.sell_price), "Sell price must be a whole number of 0 or more");
  set("min_stock", int(body.min_stock), "Min stock must be a whole number of 0 or more");
  set("low_stock", int(body.low_stock), "Low stock must be a whole number of 0 or more");
  set("stock", int(body.stock), "Stock must be a whole number of 0 or more");
  set("unit", text(body.unit, 20), "Unit is required (max 20 characters)");
  set("shelf_location", text(body.shelf_location, 50), "Shelf location is required (max 50 characters)");

  if (data.min_stock !== null && data.low_stock !== null && data.low_stock <= data.min_stock) {
    errors.low_stock = "Low stock must be greater than min stock";
  }

  if (body.image) {
    if (IMAGE_PATH.test(body.image)) data.image = body.image;
    else errors.image = "Invalid image path";
  } else if (creating) {
    errors.image = "Image is required";
  }

  return { errors, data };
}

const isDate = (value) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().startsWith(value);

const blank = (value) => value === undefined || value === null || (typeof value === "string" && value.trim() === "");

export const parseDate = (value) => (isDate(value) ? value : null);

function validateItems(raw) {
  const items = Array.isArray(raw) ? raw.map((i) => ({ product_id: int(i?.product_id, 1), quantity: int(i?.quantity, 1) })) : [];
  if (!items.length) return { items, error: "At least one product is required" };
  if (items.some((i) => i.product_id === null || i.quantity === null)) return { items, error: "Each item needs a product and a quantity of 1 or more" };
  if (new Set(items.map((i) => i.product_id)).size !== items.length) return { items, error: "Duplicate product in items" };
  return { items };
}

export function validateRestock(body) {
  const errors = {};
  const supplier_id = int(body.supplier_id, 1);
  if (supplier_id === null) errors.supplier_id = "Supplier is required";
  if (!isDate(body.order_date)) errors.order_date = "Order date is required (YYYY-MM-DD)";
  if (!isDate(body.expected_date)) errors.expected_date = "Expected date is required (YYYY-MM-DD)";
  else if (isDate(body.order_date) && body.expected_date < body.order_date) {
    errors.expected_date = "Expected date must not be before order date";
  }
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  if (notes.length > 1000) errors.notes = "Notes max 1000 characters";

  const { items, error } = validateItems(body.items);
  if (error) errors.items = error;

  return { errors, data: { supplier_id, order_date: body.order_date, expected_date: body.expected_date, notes: notes || null, items } };
}

export function validateTransaction(body) {
  const errors = {};
  const type = body.type;
  if (type !== "IN" && type !== "OUT") errors.type = "Type must be IN or OUT";
  if (!blank(body.trx_date) && !isDate(body.trx_date)) errors.trx_date = "Date must be YYYY-MM-DD";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  if (notes.length > 1000) errors.notes = "Notes max 1000 characters";

  let restock_order_id = null;
  let supplier_id = null;
  let customer_name = null;
  if (type === "IN") {
    if (!blank(body.restock_order_id)) {
      restock_order_id = int(body.restock_order_id, 1);
      if (restock_order_id === null) errors.restock_order_id = "Invalid PO";
    } else {
      supplier_id = int(body.supplier_id, 1);
      if (supplier_id === null) errors.supplier_id = "Supplier is required when there is no PO";
    }
  }
  if (type === "OUT") {
    customer_name = text(body.customer_name, 150);
    if (!customer_name) errors.customer_name = "Customer name is required (max 150 characters)";
  }

  let items = [];
  if (!(type === "IN" && restock_order_id)) {
    const result = validateItems(body.items);
    items = result.items;
    if (result.error) errors.items = result.error;
  }
  return { errors, data: { type, trx_date: blank(body.trx_date) ? null : body.trx_date, restock_order_id, supplier_id, customer_name, notes: notes || null, items } };
}

export function validateTransactionEdit(body) {
  const errors = {};
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  if (notes.length > 1000) errors.notes = "Notes max 1000 characters";
  const { items, error } = validateItems(body.items);
  if (error) errors.items = error;
  return { errors, data: { notes: notes || null, items } };
}
