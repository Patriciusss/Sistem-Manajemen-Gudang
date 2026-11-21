import pool from "@/lib/db";
import { parseId } from "@/lib/api";
import { validateProduct } from "@/lib/validators";

export const PRODUCTS_WITH_STATUS = `(
  SELECT p.*, c.name AS category_name,
    CASE WHEN p.stock = 0 THEN 'Out of Stock'
         WHEN p.stock <= p.min_stock THEN 'Severe'
         WHEN p.stock <= p.low_stock THEN 'Low'
         ELSE 'Normal' END AS stock_status
  FROM products p JOIN categories c ON c.id = p.category_id
) AS pv`;


const STOCK_STATUSES = ["Out of Stock", "Severe", "Low", "Normal"];
const SORTS = {
  name: "pv.name ASC",
  stock_asc: "pv.stock ASC, pv.name ASC",
  stock_desc: "pv.stock DESC, pv.name ASC",
  newest: "pv.created_at DESC, pv.id DESC",
  oldest: "pv.created_at ASC, pv.id ASC",
};

export async function listProducts({ search, category_id, status, sort, page = 1, limit = 10 } = {}) {
  const params = [
    search?.trim() ? `%${search.trim()}%` : null,
    parseId(category_id),
    STOCK_STATUSES.includes(status) ? status : null,
  ];
  const where = `WHERE ($1::text IS NULL OR pv.name ILIKE $1 OR pv.sku ILIKE $1)
    AND ($2::int IS NULL OR pv.category_id = $2) AND ($3::text IS NULL OR pv.stock_status = $3)`;
  const total = await pool.query(`SELECT COUNT(*)::int AS total FROM ${PRODUCTS_WITH_STATUS} ${where}`, params);
  const { rows } = await pool.query(
    `SELECT pv.id, pv.name, pv.sku, pv.category_id, pv.category_name, pv.stock, pv.unit, pv.shelf_location,
       pv.stock_status, pv.image, pv.created_at
     FROM ${PRODUCTS_WITH_STATUS} ${where} ORDER BY ${SORTS[sort] ?? SORTS.name} LIMIT $4 OFFSET $5`,
    [...params, limit, (page - 1) * limit]
  );
  return { data: rows, total: total.rows[0].total };
}

export async function getProduct(id) {
  const product = await pool.query(`SELECT * FROM ${PRODUCTS_WITH_STATUS} WHERE pv.id = $1`, [id]);
  if (!product.rows[0]) return { status: 404 };
  const history = await pool.query(
    `SELECT t.id, t.trx_number, t.type, TO_CHAR(t.trx_date, 'YYYY-MM-DD') AS trx_date, t.status, ti.quantity
     FROM transaction_items ti JOIN transactions t ON t.id = ti.transaction_id
     WHERE ti.product_id = $1 ORDER BY t.created_at DESC, t.id DESC LIMIT 5`,
    [id]
  );
  return { data: { ...product.rows[0], history: history.rows } };
}

export async function createProduct(body) {
  const { errors, data } = validateProduct(body, { creating: true });
  if (Object.keys(errors).length) return { errors };
  try {
    const { rows } = await pool.query(
      `INSERT INTO products (name, sku, category_id, description, buy_price, sell_price, min_stock, low_stock, stock, unit, shelf_location, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [data.name, data.sku, data.category_id, data.description, data.buy_price, data.sell_price, data.min_stock, data.low_stock, data.stock, data.unit, data.shelf_location, data.image]
    );
    return { data: rows[0] };
  } catch (e) {
    if (e.code === "23505") return { errors: { sku: "SKU already exists" }, status: 409 };
    if (e.code === "23503") return { errors: { category_id: "Category does not exist" } };
    throw e;
  }
}

export async function updateProduct(id, body) {
  const { errors, data } = validateProduct(body);
  if (Object.keys(errors).length) return { errors };
  try {
    const { rows } = await pool.query(
      `UPDATE products SET name = $1, category_id = $2, description = $3, buy_price = $4, sell_price = $5,
         min_stock = $6, low_stock = $7, stock = $8, unit = $9, shelf_location = $10, image = COALESCE($11, image)
       WHERE id = $12 RETURNING *`,
      [data.name, data.category_id, data.description, data.buy_price, data.sell_price, data.min_stock, data.low_stock, data.stock, data.unit, data.shelf_location, data.image ?? null, id]
    );
    return rows[0] ? { data: rows[0] } : { status: 404 };
  } catch (e) {
    if (e.code === "23503") return { errors: { category_id: "Category does not exist" } };
    throw e;
  }
}

export async function deleteProduct(id, force) {
  const { rows } = await pool.query("SELECT stock FROM products WHERE id = $1", [id]);
  if (!rows[0]) return { status: 404 };
  if (rows[0].stock > 0 && !force) return { errors: { stock: `Product still has ${rows[0].stock} in stock` }, status: 409 };
  await pool.query("DELETE FROM products WHERE id = $1", [id]);
  return { data: { id } };
}
