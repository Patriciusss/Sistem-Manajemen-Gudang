import { NextResponse } from "next/server";
import { authorize } from "@/lib/session";
import { createProduct, listProducts } from "@/lib/products";
import { respond, serverError } from "@/lib/api";

export async function GET(request) {
  const { error } = await authorize(["admin", "manager", "staff"]);
  if (error) return error;
  try {
    const query = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(query.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.get("limit")) || 10));
    const { data, total } = await listProducts({
      search: query.get("search"),
      category_id: query.get("category_id"),
      status: query.get("status"),
      sort: query.get("sort"),
      page,
      limit,
    });
    return NextResponse.json({ data, page, limit, total });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(request) {
  const { error } = await authorize(["admin", "manager"]);
  if (error) return error;
  try {
    return respond(await createProduct(await request.json().catch(() => ({}))), 201);
  } catch (e) {
    return serverError(e);
  }
}
