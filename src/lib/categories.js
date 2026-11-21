import pool from "@/lib/db";
import { validateCategory } from "@/lib/validators";

export async function listCategories() {
  const { rows } = await pool.query(
    `SELECT c.*, COUNT(p.id)::int AS product_count
     FROM categories c LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id ORDER BY c.name`
  );
  return { data: rows };
}

export async function getCategory(id) {
  const { rows } = await pool.query("SELECT * FROM categories WHERE id = $1", [id]);
  return rows[0] ? { data: rows[0] } : { status: 404 };
}

const duplicate = { errors: { name: "Category name already exists" }, status: 409 };

export async function createCategory(body) {
  const { errors, data } = validateCategory(body);
  if (Object.keys(errors).length) return { errors };
  try {
    const { rows } = await pool.query(
      "INSERT INTO categories (name, description, image) VALUES ($1, $2, $3) RETURNING *",
      [data.name, data.description, data.image]
    );
    return { data: rows[0] };
  } catch (e) {
    if (e.code === "23505") return duplicate;
    throw e;
  }
}

export async function updateCategory(id, body) {
  const { errors, data } = validateCategory(body);
  if (Object.keys(errors).length) return { errors };
  try {
    const { rows } = await pool.query(
      "UPDATE categories SET name = $1, description = $2, image = COALESCE($3, image) WHERE id = $4 RETURNING *",
      [data.name, data.description, data.image, id]
    );
    return rows[0] ? { data: rows[0] } : { status: 404 };
  } catch (e) {
    if (e.code === "23505") return duplicate;
    throw e;
  }
}

export async function deleteCategory(id) {
  try {
    const { rowCount } = await pool.query("DELETE FROM categories WHERE id = $1", [id]);
    return rowCount ? { data: { id } } : { status: 404 };
  } catch (e) {
    if (e.code === "23001" || e.code === "23503") return { errors: { id: "Category still has products" }, status: 409 };
    throw e;
  }
}
