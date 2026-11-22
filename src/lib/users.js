import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function listUsers() {
  const { rows } = await pool.query("SELECT id, name, email, role, status FROM users ORDER BY role, name");
  return { data: rows };
}

export async function resetPassword(id, password) {
  if ((password ?? "").length < 6) return { errors: { password: "Password must be at least 6 characters" } };
  const hash = await bcrypt.hash(password, 10);
  const { rowCount } = await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hash, id]);
  if (!rowCount) return { status: 404 };
  await pool.query("DELETE FROM sessions WHERE user_id = $1", [id]);
  return { data: { id } };
}
