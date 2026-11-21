import { NextResponse } from "next/server";
import { authorize } from "@/lib/session";
import { createTransaction, listTransactions } from "@/lib/transactions";
import { respond, serverError } from "@/lib/api";

export async function GET(request) {
  const { error } = await authorize(["admin", "manager", "staff"]);
  if (error) return error;
  try {
    const query = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(query.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.get("limit")) || 10));
    const { data, total } = await listTransactions({
      type: query.get("type"),
      status: query.get("status"),
      date_from: query.get("date_from"),
      date_to: query.get("date_to"),
      party: query.get("party"),
      page,
      limit,
    });
    return NextResponse.json({ data, page, limit, total });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(request) {
  const { user, error } = await authorize(["manager", "staff"]);
  if (error) return error;
  try {
    return respond(await createTransaction(user, await request.json().catch(() => ({}))), 201);
  } catch (e) {
    return serverError(e);
  }
}
