"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { reviewSupplier } from "@/lib/suppliers";
import { parseId } from "@/lib/api";

export async function reviewSupplierAction(formData) {
  await requireUser(["admin"]);
  const id = parseId(formData.get("id"));
  if (!id) return { errors: { id: "Invalid supplier" } };
  const result = await reviewSupplier(id, formData.get("status"));
  if (result.status === 404) return { errors: { id: "Supplier not found" } };
  if (result.errors) return { errors: result.errors };
  revalidatePath("/admin");
  return { ok: true };
}