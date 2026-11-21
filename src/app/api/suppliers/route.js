import { NextResponse } from "next/server";
import { authorize } from "@/lib/session";
import { listSuppliers } from "@/lib/suppliers";
import { serverError } from "@/lib/api";

export async function GET(request) {
  const { user, error } = await authorize(["admin", "manager"]);
  if (error) return error;
  try {
    const status = user.role === "manager" ? "Approved" : request.nextUrl.searchParams.get("status");
    return NextResponse.json(await listSuppliers(status));
  } catch (e) {
    return serverError(e);
  }
}
