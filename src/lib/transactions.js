import pool from "@/lib/db";
import { parseDate, validateTransaction, validateTransactionEdit } from "@/lib/validators";

const FROM = `FROM transactions t
  LEFT JOIN users s ON s.id = t.supplier_id
  LEFT JOIN restock_orders r ON r.id = t.restock_order_id`;
const COLUMNS = `t.id, t.trx_number, t.type, TO_CHAR(t.trx_date, 'YYYY-MM-DD') AS trx_date, t.status,
  t.customer_name, s.name AS supplier_name, r.po_number`;

const ownerOnly = (user) => (user.role === "staff" ? user.id : null);

async function resolveItems(db, type, items) {
  const { rows } = await db.query("SELECT id, name, sku, stock FROM products WHERE id = ANY($1::int[])", [items.map((i) => i.product_id)]);
  if (rows.length !== items.length) return { error: "Some products do not exist" };
  const byId = new Map(rows.map((p) => [p.id, p]));
  if (type === "OUT") {
    const over = items.find((i) => i.quantity > byId.get(i.product_id).stock);
    if (over) {
      const p = byId.get(over.product_id);
      return { error: `Quantity for ${p.name} exceeds available stock (${p.stock})` };
    }
  }
  return { items: items.map((i) => ({ ...i, product_name: byId.get(i.product_id).name, product_sku: byId.get(i.product_id).sku })) };
}

const addItems = (client, transactionId, items) =>
  client.query(
    `INSERT INTO transaction_items (transaction_id, product_id, product_name, product_sku, quantity)
     SELECT $1::int, * FROM UNNEST($2::int[], $3::text[], $4::text[], $5::int[])`,
    [transactionId, items.map((i) => i.product_id), items.map((i) => i.product_name), items.map((i) => i.product_sku), items.map((i) => i.quantity)]
  );

export async function listTransactions({ type, status, date_from, date_to, party, page = 1, limit = 10 } = {}) {
  const params = [
    ["IN", "OUT"].includes(type) ? type : null,
    ["Pending", "Approved", "Rejected", "Shipped"].includes(status) ? status : null,
    parseDate(date_from),
    parseDate(date_to),
    party?.trim() ? `%${party.trim()}%` : null,
  ];
  const where = `WHERE ($1::text IS NULL OR t.type = $1) AND ($2::text IS NULL OR t.status = $2)
    AND ($3::date IS NULL OR t.trx_date >= $3) AND ($4::date IS NULL OR t.trx_date <= $4)
    AND ($5::text IS NULL OR s.name ILIKE $5 OR t.customer_name ILIKE $5)`;
  const total = await pool.query(`SELECT COUNT(*)::int AS total ${FROM} ${where}`, params);
  const { rows } = await pool.query(
    `SELECT ${COLUMNS},
       (SELECT COUNT(*)::int FROM transaction_items i WHERE i.transaction_id = t.id) AS item_count,
       (SELECT COALESCE(SUM(quantity), 0)::int FROM transaction_items i WHERE i.transaction_id = t.id) AS total_quantity
     ${FROM} ${where} ORDER BY t.trx_date DESC, t.id DESC LIMIT $6 OFFSET $7`,
    [...params, limit, (page - 1) * limit]
  );
  return { data: rows, total: total.rows[0].total };
}

export async function getTransaction(id) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS}, t.notes, t.reject_reason, t.restock_order_id, t.supplier_id, t.created_by,
       cu.name AS created_by_name, au.name AS approved_by_name
     ${FROM} JOIN users cu ON cu.id = t.created_by LEFT JOIN users au ON au.id = t.approved_by
     WHERE t.id = $1`,
    [id]
  );
  if (!rows[0]) return { status: 404 };
  const items = await pool.query(
    "SELECT id, product_id, product_name, product_sku, quantity FROM transaction_items WHERE transaction_id = $1 ORDER BY id",
    [id]
  );
  return { data: { ...rows[0], items: items.rows } };
}

export async function createTransaction(user, body) {
  const { errors, data } = validateTransaction(body);
  if (Object.keys(errors).length) return { errors };

  let supplier_id = data.supplier_id;
  let items;
  if (data.restock_order_id) {
    const po = await pool.query("SELECT supplier_id, status FROM restock_orders WHERE id = $1", [data.restock_order_id]);
    if (!po.rows[0] || po.rows[0].status !== "Inspecting") return { errors: { restock_order_id: "PO must exist and be Inspecting" } };
    const poItems = await pool.query(
      "SELECT product_id, product_name, product_sku, quantity FROM restock_order_items WHERE restock_order_id = $1 ORDER BY id",
      [data.restock_order_id]
    );
    if (poItems.rows.some((i) => !i.product_id)) return { errors: { restock_order_id: "Some products in this PO no longer exist" } };
    supplier_id = po.rows[0].supplier_id;
    items = poItems.rows;
  } else {
    if (data.type === "IN") {
      const supplier = await pool.query("SELECT 1 FROM users WHERE id = $1 AND role = 'supplier' AND status = 'Approved'", [supplier_id]);
      if (!supplier.rowCount) return { errors: { supplier_id: "Supplier must be an approved supplier" } };
    }
    const resolved = await resolveItems(pool, data.type, data.items);
    if (resolved.error) return { errors: { items: resolved.error } };
    items = resolved.items;
  }

  const client = await pool.connect();
  let id;
  try {
    await client.query("BEGIN");
    const created = await client.query(
      `INSERT INTO transactions (type, trx_date, restock_order_id, supplier_id, customer_name, notes, created_by)
       VALUES ($1, COALESCE($2::date, CURRENT_DATE), $3, $4, $5, $6, $7) RETURNING id`,
      [data.type, data.trx_date, data.restock_order_id, supplier_id, data.customer_name, data.notes, user.id]
    );
    id = created.rows[0].id;
    await addItems(client, id, items);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    if (e.code === "23505") return { errors: { restock_order_id: "This PO already has an active incoming transaction" }, status: 409 };
    throw e;
  } finally {
    client.release();
  }
  return getTransaction(id);
}

export async function updateTransaction(user, id, body) {
  const { errors, data } = validateTransactionEdit(body);
  if (Object.keys(errors).length) return { errors };

  const client = await pool.connect();
  let result;
  try {
    await client.query("BEGIN");
    const found = await client.query("SELECT type, status, created_by FROM transactions WHERE id = $1 FOR UPDATE", [id]);
    const t = found.rows[0];
    if (!t) result = { status: 404 };
    else if (ownerOnly(user) && t.created_by !== user.id) result = { errors: { id: "Not your transaction" }, status: 403 };
    else if (t.status !== "Pending") result = { errors: { status: "Only Pending transactions can be edited" }, status: 409 };
    else {
      const resolved = await resolveItems(client, t.type, data.items);
      if (resolved.error) result = { errors: { items: resolved.error } };
      else {
        await client.query("UPDATE transactions SET notes = $1 WHERE id = $2", [data.notes, id]);
        await client.query("DELETE FROM transaction_items WHERE transaction_id = $1", [id]);
        await addItems(client, id, resolved.items);
      }
    }
    await client.query(result ? "ROLLBACK" : "COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
  return result || getTransaction(id);
}

export async function deleteTransaction(user, id) {
  const { rows } = await pool.query(
    "DELETE FROM transactions WHERE id = $1 AND status = 'Pending' AND ($2::int IS NULL OR created_by = $2) RETURNING id",
    [id, ownerOnly(user)]
  );
  if (rows[0]) return { data: rows[0] };
  const found = await pool.query("SELECT created_by FROM transactions WHERE id = $1", [id]);
  if (!found.rows[0]) return { status: 404 };
  if (ownerOnly(user) && found.rows[0].created_by !== user.id) return { errors: { id: "Not your transaction" }, status: 403 };
  return { errors: { status: "Only Pending transactions can be deleted" }, status: 409 };
}

async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query(result.data ? "COMMIT" : "ROLLBACK");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function applyStock(client, id, sign) {
  const items = (await client.query("SELECT product_id, product_name, quantity FROM transaction_items WHERE transaction_id = $1", [id])).rows;
  const ids = items.map((i) => i.product_id);
  const locked = ids.includes(null) ? null : await client.query("SELECT id, stock FROM products WHERE id = ANY($1::int[]) ORDER BY id FOR UPDATE", [ids]);
  if (!locked || locked.rowCount !== items.length) return { errors: { items: "A product in this transaction no longer exists" }, status: 409 };
  const current = new Map(locked.rows.map((p) => [p.id, p.stock]));
  const short = sign < 0 && items.find((i) => i.quantity > current.get(i.product_id));
  if (short) return { errors: { items: `Insufficient stock for ${short.product_name} (${current.get(short.product_id)} left)` }, status: 409 };
  for (const i of items) await client.query("UPDATE products SET stock = stock + $1 WHERE id = $2", [sign * i.quantity, i.product_id]);
  return null;
}

const reviewTransaction = (user, id, status, reason) => {
  const text = typeof reason === "string" ? reason.trim() : "";
  if (status === "Rejected" && !text) return { errors: { reason: "Reason is required when rejecting" } };

  return withTransaction(async (client) => {
    const found = await client.query("SELECT type, status, restock_order_id FROM transactions WHERE id = $1 FOR UPDATE", [id]);
    const t = found.rows[0];
    if (!t) return { status: 404 };
    if (t.status !== "Pending") return { errors: { status: "Transaction is not Pending" }, status: 409 };
    if (status === "Approved" && t.type === "IN") {
      const failed = await applyStock(client, id, 1);
      if (failed) return failed;
      if (t.restock_order_id) {
        const po = await client.query("UPDATE restock_orders SET status = 'Received' WHERE id = $1 AND status = 'Inspecting'", [t.restock_order_id]);
        if (!po.rowCount) return { errors: { restock_order_id: "The PO is no longer being inspected" }, status: 409 };
      }
    }
    if (status === "Rejected" && t.restock_order_id) {
      await client.query("UPDATE restock_orders SET status = 'Returned', status_note = $1 WHERE id = $2 AND status = 'Inspecting'", [text, t.restock_order_id]);
    }
    const updated = await client.query(
      `UPDATE transactions SET status = $1, reject_reason = $2, approved_by = $3 WHERE id = $4
       RETURNING id, trx_number, status, reject_reason`,
      [status, status === "Rejected" ? text : null, status === "Approved" ? user.id : null, id]
    );
    return { data: updated.rows[0] };
  });
};

const shipTransaction = (id) =>
  withTransaction(async (client) => {
    const found = await client.query("SELECT type, status FROM transactions WHERE id = $1 FOR UPDATE", [id]);
    const t = found.rows[0];
    if (!t) return { status: 404 };
    if (t.type !== "OUT" || t.status !== "Approved") return { errors: { status: "Only an Approved outgoing transaction can be shipped" }, status: 409 };
    const failed = await applyStock(client, id, -1);
    if (failed) return failed;
    const updated = await client.query("UPDATE transactions SET status = 'Shipped' WHERE id = $1 RETURNING id, trx_number, status", [id]);
    return { data: updated.rows[0] };
  });

export async function changeTransactionStatus(user, id, status, reason) {
  if (status === "Approved" || status === "Rejected") {
    return user.role === "manager" ? reviewTransaction(user, id, status, reason) : { errors: { status: "Only a manager can approve or reject" }, status: 403 };
  }
  if (status !== "Shipped") return { errors: { status: "Invalid status" } };
  if (user.role !== "staff") return { errors: { status: "Only staff can mark Shipped" }, status: 403 };
  return shipTransaction(id);
}
