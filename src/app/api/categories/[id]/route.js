import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authorize } from "@/lib/session";
import { validateCategory } from "@/lib/validators";
import { invalid, notFound, parseId, serverError } from "@/lib/api";

export async function PUT(request, { params }) {
  const { error } = await authorize(["admin", "manager"]);
  if (error) return error;
  const id = parseId((await params).id);
  if (!id) return notFound();
  const { errors, data } = validateCategory(await request.json().catch(() => ({})));
  if (Object.keys(errors).length) return invalid(errors);
  try {
    const { rows } = await pool.query(
      "UPDATE categories SET name = $1, description = $2, image = COALESCE($3, image) WHERE id = $4 RETURNING *",
      [data.name, data.description, data.image, id]
    );
    return rows[0] ? NextResponse.json({ data: rows[0] }) : notFound();
  } catch (e) {
    if (e.code === "23505") return invalid({ name: "Category name already exists" }, 409);
    return serverError(e);
  }
}

export async function DELETE(_request, { params }) {
  const { error } = await authorize(["admin", "manager"]);
  if (error) return error;
  const id = parseId((await params).id);
  if (!id) return notFound();
  try {
    const { rowCount } = await pool.query("DELETE FROM categories WHERE id = $1", [id]);
    return rowCount ? NextResponse.json({ message: "Category deleted" }) : notFound();
  } catch (e) {
    if (e.code === "23001" || e.code === "23503") {
      return NextResponse.json({ message: "Category still has products" }, { status: 409 });
    }
    return serverError(e);
  }
}
