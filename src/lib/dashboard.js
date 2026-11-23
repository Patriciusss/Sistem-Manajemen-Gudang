import pool from "@/lib/db";
import { PRODUCTS_WITH_STATUS } from "@/lib/products";
import { listSuppliers } from "@/lib/suppliers";

const one = async (sql, params) => (await pool.query(sql, params)).rows[0];
const many = async (sql, params) => (await pool.query(sql, params)).rows;

const TRX_ROW = `t.id, t.trx_number, t.type, TO_CHAR(t.trx_date, 'YYYY-MM-DD') AS trx_date, t.status,
  COALESCE(t.customer_name, s.name) AS party,
  (SELECT COALESCE(SUM(quantity), 0)::int FROM transaction_items i WHERE i.transaction_id = t.id) AS total_quantity
  FROM transactions t LEFT JOIN users s ON s.id = t.supplier_id`;

const PO_ROW = `r.id, r.po_number, r.status, TO_CHAR(r.expected_date, 'YYYY-MM-DD') AS expected_date, u.name AS supplier_name,
  (SELECT COALESCE(SUM(quantity), 0)::int FROM restock_order_items i WHERE i.restock_order_id = r.id) AS total_quantity
  FROM restock_orders r JOIN users u ON u.id = r.supplier_id`;

async function admin() {
  const [totals, suppliers, critical] = await Promise.all([
    one(
      `SELECT (SELECT COUNT(*)::int FROM products) AS total_products,
         (SELECT COUNT(*)::int FROM transactions WHERE DATE_TRUNC('month', trx_date) = DATE_TRUNC('month', CURRENT_DATE)) AS month_transactions,
         (SELECT COALESCE(SUM(stock::bigint * buy_price), 0)::float8 FROM products) AS inventory_value`
    ),
    listSuppliers("Pending"),
    many(
      `SELECT pv.id, pv.name, pv.sku, pv.stock, pv.unit, pv.stock_status FROM ${PRODUCTS_WITH_STATUS}
       WHERE pv.stock_status IN ('Severe', 'Out of Stock') ORDER BY pv.stock, pv.name LIMIT 10`
    ),
  ]);
  return { ...totals, pending_suppliers: suppliers.data, critical_products: critical };
}

async function manager() {
  const [stock, pending, restock] = await Promise.all([
    one(
      `SELECT COUNT(*)::int AS total_products, COALESCE(SUM(stock), 0)::int AS total_items,
         COUNT(*) FILTER (WHERE stock_status = 'Out of Stock')::int AS out_of_stock,
         COUNT(*) FILTER (WHERE stock_status = 'Severe')::int AS severe,
         COUNT(*) FILTER (WHERE stock_status = 'Low')::int AS low
       FROM ${PRODUCTS_WITH_STATUS}`
    ),
    many(`SELECT ${TRX_ROW} WHERE t.status = 'Pending' ORDER BY t.created_at, t.id LIMIT 10`),
    many(`SELECT ${PO_ROW} WHERE r.status IN ('Pending', 'Confirmed', 'In Transit', 'Inspecting') ORDER BY r.created_at DESC, r.id DESC LIMIT 10`),
  ]);
  return { ...stock, pending_transactions: pending, active_restock: restock };
}

async function staff(user) {
  const today = await many(`SELECT ${TRX_ROW} WHERE t.created_by = $1 AND t.trx_date = CURRENT_DATE ORDER BY t.created_at DESC, t.id DESC`, [user.id]);
  return { today_transactions: today };
}

async function supplier(user) {
  const [toConfirm, history] = await Promise.all([
    many(`SELECT ${PO_ROW} WHERE r.supplier_id = $1 AND r.status = 'Pending' ORDER BY r.created_at, r.id`, [user.id]),
    many(`SELECT ${PO_ROW} WHERE r.supplier_id = $1 AND r.status IN ('In Transit', 'Inspecting', 'Received', 'Returned') ORDER BY r.created_at DESC, r.id DESC LIMIT 10`, [user.id]),
  ]);
  return { to_confirm: toConfirm, shipment_history: history };
}

const byRole = { admin, manager, staff, supplier };

export const getDashboard = (user) => byRole[user.role](user);
