import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authorize } from "@/lib/session";
import { validateCategory } from "@/lib/validators";
import { invalid, serverError } from "@/lib/api";

export async function GET() {
  const { error } = await authorize(["admin", "manager", "staff"]);
  if (error) return error;
  try {
    const { rows } = await pool.query(
      `SELECT c.*, COUNT(p.id)::int AS product_count
       FROM categories c LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id ORDER BY c.name`
    );
    return NextResponse.json({ data: rows });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(request) {
  const { error } = await authorize(["admin", "manager"]);
  if (error) return error;
  const { errors, data } = validateCategory(await request.json().catch(() => ({})));
  if (Object.keys(errors).length) return invalid(errors);
  try {
    const { rows } = await pool.query(
      "INSERT INTO categories (name, description, image) VALUES ($1, $2, $3) RETURNING *",
      [data.name, data.description, data.image]
    );
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (e) {
    if (e.code === "23505") return invalid({ name: "Category name already exists" }, 409);
    return serverError(e);
  }
}
