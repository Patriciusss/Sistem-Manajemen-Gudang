import pool from "@/lib/db";
import { validateRestock } from "@/lib/validators";

const DATES = "TO_CHAR(r.order_date, 'YYYY-MM-DD') AS order_date, TO_CHAR(r.expected_date, 'YYYY-MM-DD') AS expected_date";
const TRANSITIONS = {
  Confirmed: { from: "Pending", role: "supplier" },
  Rejected: { from: "Pending", role: "supplier" },
  "In Transit": { from: "Confirmed", role: "supplier" },
  Inspecting: { from: "In Transit", role: "manager" },
  Returned: { from: "Inspecting", role: "manager" },
};
const PHOTO = /^\/uploads\/[\w.-]+$/;

const ownOnly = (user) => (user.role === "supplier" ? user.id : null);

export async function listRestock(user, { status, page = 1, limit = 10 } = {}) {
  const params = [ownOnly(user), Object.keys(TRANSITIONS).concat("Pending", "Received").includes(status) ? status : null];
  const where = "WHERE ($1::int IS NULL OR r.supplier_id = $1) AND ($2::text IS NULL OR r.status = $2)";
  const total = await pool.query(`SELECT COUNT(*)::int AS total FROM restock_orders r ${where}`, params);
  const { rows } = await pool.query(
    `SELECT r.id, r.po_number, r.status, r.status_note, ${DATES}, u.name AS supplier_name,
       (SELECT COUNT(*)::int FROM restock_order_items i WHERE i.restock_order_id = r.id) AS item_count,
       (SELECT COALESCE(SUM(quantity), 0)::int FROM restock_order_items i WHERE i.restock_order_id = r.id) AS total_quantity
     FROM restock_orders r JOIN users u ON u.id = r.supplier_id ${where}
     ORDER BY r.created_at DESC, r.id DESC LIMIT $3 OFFSET $4`,
    [...params, limit, (page - 1) * limit]
  );
  return { data: rows, total: total.rows[0].total };
}

export async function getRestock(user, id) {
  const order = await pool.query(
    `SELECT r.id, r.po_number, r.status, r.status_note, r.notes, r.supplier_id, r.arrival_photo, r.inspection_report, ${DATES}, u.name AS supplier_name, m.name AS manager_name
     FROM restock_orders r JOIN users u ON u.id = r.supplier_id JOIN users m ON m.id = r.manager_id
     WHERE r.id = $1 AND ($2::int IS NULL OR r.supplier_id = $2)`,
    [id, ownOnly(user)]
  );
  if (!order.rows[0]) return { status: 404 };
  const items = await pool.query(
    "SELECT id, product_id, product_name, product_sku, quantity FROM restock_order_items WHERE restock_order_id = $1 ORDER BY id",
    [id]
  );
  return { data: { ...order.rows[0], items: items.rows } };
}

export async function createRestock(managerId, body) {
  const { errors, data } = validateRestock(body);
  if (Object.keys(errors).length) return { errors };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const supplier = await client.query("SELECT 1 FROM users WHERE id = $1 AND role = 'supplier' AND status = 'Approved'", [data.supplier_id]);
    if (!supplier.rowCount) {
      await client.query("ROLLBACK");
      return { errors: { supplier_id: "Supplier must be an approved supplier" } };
    }
    const ids = data.items.map((i) => i.product_id);
    const products = await client.query("SELECT id, name, sku FROM products WHERE id = ANY($1::int[])", [ids]);
    if (products.rowCount !== ids.length) {
      await client.query("ROLLBACK");
      return { errors: { items: "Some products do not exist" } };
    }
    const order = await client.query(
      `INSERT INTO restock_orders (supplier_id, manager_id, order_date, expected_date, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [data.supplier_id, managerId, data.order_date, data.expected_date, data.notes]
    );
    const byId = new Map(products.rows.map((p) => [p.id, p]));
    for (const item of data.items) {
      const p = byId.get(item.product_id);
      await client.query(
        "INSERT INTO restock_order_items (restock_order_id, product_id, product_name, product_sku, quantity) VALUES ($1, $2, $3, $4, $5)",
        [order.rows[0].id, p.id, p.name, p.sku, item.quantity]
      );
    }
    await client.query("COMMIT");
    return getRestock({ role: "manager" }, order.rows[0].id);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function changeRestockStatus(user, id, status, note) {
  const rule = TRANSITIONS[status];
  if (!rule) return { errors: { status: "Invalid status" } };
  if (rule.role !== user.role) return { errors: { status: "Not allowed for your role" }, status: 403 };
  const text = typeof note === "string" ? note.trim() : "";
  if (["Rejected", "Returned"].includes(status) && !text) return { errors: { note: `Reason is required when ${status === "Rejected" ? "rejecting" : "returning"}` } };

  const { rows } = await pool.query(
    `UPDATE restock_orders SET status = $1::text, status_note = COALESCE($2, status_note)
     WHERE id = $3 AND status = $4 AND ($5::int IS NULL OR supplier_id = $5)
       AND ($1::text <> 'Inspecting' OR arrival_photo IS NOT NULL)
     RETURNING id, po_number, status, status_note`,
    [status, text || null, id, rule.from, ownOnly(user)]
  );
  if (rows[0]) return { data: rows[0] };
  const found = await pool.query("SELECT status FROM restock_orders WHERE id = $1 AND ($2::int IS NULL OR supplier_id = $2)", [id, ownOnly(user)]);
  if (!found.rows[0]) return { status: 404 };
  return found.rows[0].status === rule.from
    ? { errors: { arrival_photo: "The supplier has not submitted an arrival photo yet" }, status: 409 }
    : { errors: { status: `Order must be ${rule.from} to become ${status}` }, status: 409 };
}

async function blocked(user, id, needed) {
  const found = await pool.query("SELECT 1 FROM restock_orders WHERE id = $1 AND ($2::int IS NULL OR supplier_id = $2)", [id, ownOnly(user)]);
  return found.rowCount ? { errors: { status: `Order must be ${needed}` }, status: 409 } : { status: 404 };
}

export async function submitArrivalPhoto(user, id, photo) {
  if (user.role !== "supplier") return { errors: { arrival_photo: "Only the supplier can submit the arrival photo" }, status: 403 };
  if (typeof photo !== "string" || !PHOTO.test(photo)) return { errors: { arrival_photo: "Upload a photo first" } };
  const { rows } = await pool.query(
    "UPDATE restock_orders SET arrival_photo = $1 WHERE id = $2 AND supplier_id = $3 AND status = 'In Transit' RETURNING id, po_number, status, arrival_photo",
    [photo, id, user.id]
  );
  return rows[0] ? { data: rows[0] } : blocked(user, id, "In Transit");
}

export async function submitInspectionReport(user, id, report) {
  if (user.role !== "staff") return { errors: { inspection_report: "Only warehouse staff can submit the inspection report" }, status: 403 };
  const text = typeof report === "string" ? report.trim() : "";
  if (!text || text.length > 5000) return { errors: { inspection_report: "Report is required (max 5000 characters)" } };
  const { rows } = await pool.query(
    "UPDATE restock_orders SET inspection_report = $1 WHERE id = $2 AND status = 'Inspecting' RETURNING id, po_number, status, inspection_report",
    [text, id]
  );
  return rows[0] ? { data: rows[0] } : blocked(user, id, "Inspecting");
}

export function updateRestock(user, id, body) {
  if (body.arrival_photo !== undefined) return submitArrivalPhoto(user, id, body.arrival_photo);
  if (body.inspection_report !== undefined) return submitInspectionReport(user, id, body.inspection_report);
  return changeRestockStatus(user, id, body.status, body.note);
}
