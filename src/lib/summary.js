import pool from "@/lib/db";
import { PRODUCTS_WITH_STATUS } from "@/lib/products";

const toCounts = (rows, keys) => {
  const counts = Object.fromEntries(keys.map((key) => [key, 0]));
  for (const r of rows) counts[r.status] = r.count;
  return { ...counts, total: Object.values(counts).reduce((a, b) => a + b, 0) };
};

export async function productStatusCounts() {
  const { rows } = await pool.query(`SELECT pv.stock_status AS status, COUNT(*)::int AS count FROM ${PRODUCTS_WITH_STATUS} GROUP BY pv.stock_status`);
  return toCounts(rows, ["Out of Stock", "Severe", "Low", "Normal"]);
}

export async function transactionStatusCounts(type) {
  const { rows } = await pool.query("SELECT status, COUNT(*)::int AS count FROM transactions WHERE type = $1 GROUP BY status", [type]);
  return toCounts(rows, ["Pending", "Approved", "Rejected", "Shipped"]);
}

export async function restockStatusCounts(user) {
  const { rows } = await pool.query(
    "SELECT status, COUNT(*)::int AS count FROM restock_orders WHERE ($1::int IS NULL OR supplier_id = $1) GROUP BY status",
    [user.role === "supplier" ? user.id : null]
  );
  return toCounts(rows, ["Pending", "Confirmed", "In Transit", "Inspecting", "Received", "Rejected", "Returned"]);
}

export async function availablePos() {
  const { rows } = await pool.query(
    `SELECT r.id, r.po_number, u.name AS supplier_name,
       (SELECT STRING_AGG(i.product_name || ' x' || i.quantity, ', ' ORDER BY i.id) FROM restock_order_items i WHERE i.restock_order_id = r.id) AS items_summary
     FROM restock_orders r JOIN users u ON u.id = r.supplier_id
     WHERE r.status = 'Inspecting' AND NOT EXISTS (SELECT 1 FROM transactions t WHERE t.restock_order_id = r.id AND t.status <> 'Rejected')
     ORDER BY r.id DESC`
  );
  return rows;
}
