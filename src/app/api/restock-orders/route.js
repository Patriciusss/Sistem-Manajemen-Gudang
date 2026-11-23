import { NextResponse } from "next/server";
import { authorize } from "@/lib/session";
import { createRestock, listRestock } from "@/lib/restock";
import { respond, serverError } from "@/lib/api";

export async function GET(request) {
  const { user, error } = await authorize(["manager", "supplier", "staff"]);
  if (error) return error;
  try {
    const query = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(query.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.get("limit")) || 10));
    const { data, total } = await listRestock(user, { status: query.get("status"), page, limit });
    return NextResponse.json({ data, page, limit, total });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(request) {
  const { user, error } = await authorize(["manager"]);
  if (error) return error;
  try {
    return respond(await createRestock(user.id, await request.json().catch(() => ({}))), 201);
  } catch (e) {
    return serverError(e);
  }
}
