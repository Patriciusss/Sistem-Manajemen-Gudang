"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { changeRestockStatus, createRestock } from "@/lib/restock";
import { parseId } from "@/lib/api";

const finish = (result) => {
  if (result.status === 404) return { errors: { id: "Order not found" } };
  if (result.errors) return { errors: result.errors };
  revalidatePath("/manager/restock");
  revalidatePath("/supplier/restock");
  return { ok: true };
};

export async function createRestockAction(formData) {
  const user = await requireUser(["manager"]);
  const productIds = formData.getAll("product_id");
  const quantities = formData.getAll("quantity");
  const items = productIds.map((product_id, i) => ({ product_id, quantity: quantities[i] }));
  return finish(
    await createRestock(user.id, {
      supplier_id: formData.get("supplier_id"),
      order_date: formData.get("order_date"),
      expected_date: formData.get("expected_date"),
      notes: formData.get("notes"),
      items,
    })
  );
}

export async function changeRestockStatusAction(formData) {
  const user = await requireUser(["manager", "supplier"]);
  const id = parseId(formData.get("id"));
  if (!id) return { errors: { id: "Invalid order" } };
  return finish(await changeRestockStatus(user, id, formData.get("status"), formData.get("note")));
}