import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authorize } from "@/lib/session";
import { validateProduct } from "@/lib/validators";
import { invalid, notFound, parseId, serverError } from "@/lib/api";
import { PRODUCTS_WITH_STATUS } from "@/lib/products";

export async function GET(_request, { params }) {
  const { error } = await authorize(["admin", "manager", "staff"]);
  if (error) return error;
  const id = parseId((await params).id);
  if (!id) return notFound();
  try {
    const product = await pool.query(`SELECT * FROM ${PRODUCTS_WITH_STATUS} WHERE id = $1`, [id]);
    if (!product.rows[0]) return notFound();
    const history = await pool.query(
      `SELECT t.trx_number, t.type, t.trx_date, t.status, ti.quantity
       FROM transaction_items ti JOIN transactions t ON t.id = ti.transaction_id
       WHERE ti.product_id = $1 ORDER BY t.created_at DESC, t.id DESC LIMIT 5`,
      [id]
    );
    return NextResponse.json({ data: { ...product.rows[0], history: history.rows } });
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(request, { params }) {
  const { error } = await authorize(["admin", "manager"]);
  if (error) return error;
  const id = parseId((await params).id);
  if (!id) return notFound();
  const { errors, data } = validateProduct(await request.json().catch(() => ({})));
  if (Object.keys(errors).length) return invalid(errors);
  try {
    const { rows } = await pool.query(
      `UPDATE products SET name = $1, category_id = $2, description = $3, buy_price = $4, sell_price = $5,
         min_stock = $6, low_stock = $7, stock = $8, unit = $9, shelf_location = $10, image = COALESCE($11, image)
       WHERE id = $12 RETURNING *`,
      [data.name, data.category_id, data.description, data.buy_price, data.sell_price, data.min_stock, data.low_stock, data.stock, data.unit, data.shelf_location, data.image ?? null, id]
    );
    return rows[0] ? NextResponse.json({ data: rows[0] }) : notFound();
  } catch (e) {
    if (e.code === "23503") return invalid({ category_id: "Category does not exist" });
    return serverError(e);
  }
}

export async function DELETE(request, { params }) {
  const { error } = await authorize(["admin", "manager"]);
  if (error) return error;
  const id = parseId((await params).id);
  if (!id) return notFound();
  try {
    const { rows } = await pool.query("SELECT stock FROM products WHERE id = $1", [id]);
    if (!rows[0]) return notFound();
    if (rows[0].stock > 0 && request.nextUrl.searchParams.get("force") !== "true") {
      return NextResponse.json({ message: "Product still has stock", stock: rows[0].stock }, { status: 409 });
    }
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    return NextResponse.json({ message: "Product deleted" });
  } catch (e) {
    return serverError(e);
  }
}
