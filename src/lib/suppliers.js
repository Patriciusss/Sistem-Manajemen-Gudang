import pool from "@/lib/db";

const STATUSES = ["Pending", "Approved", "Rejected"];

export async function listSuppliers(status) {
  const { rows } = await pool.query(
    "SELECT id, name, email, status, created_at FROM users WHERE role = 'supplier' AND status = $1 ORDER BY created_at, id",
    [STATUSES.includes(status) ? status : "Pending"]
  );
  return { data: rows };
}

export async function reviewSupplier(id, status) {
  if (!["Approved", "Rejected"].includes(status)) return { errors: { status: "Status must be Approved or Rejected" } };
  const { rows } = await pool.query(
    "UPDATE users SET status = $1 WHERE id = $2 AND role = 'supplier' AND status = 'Pending' RETURNING id, name, email, status",
    [status, id]
  );
  if (rows[0]) return { data: rows[0] };
  const exists = await pool.query("SELECT 1 FROM users WHERE id = $1 AND role = 'supplier'", [id]);
  return exists.rowCount ? { errors: { status: "Supplier is not pending" }, status: 409 } : { status: 404 };
}
