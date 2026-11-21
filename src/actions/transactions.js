"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { changeTransactionStatus, createTransaction, deleteTransaction, updateTransaction } from "@/lib/transactions";
import { parseId } from "@/lib/api";

const finish = (result) => {
  if (result.status === 404) return { errors: { id: "Transaction not found" } };
  if (result.errors) return { errors: result.errors };
  revalidatePath("/", "layout");
  return { ok: true };
};

const readItems = (formData) => {
  const quantities = formData.getAll("quantity");
  return formData.getAll("product_id").map((product_id, i) => ({ product_id, quantity: quantities[i] }));
};

export async function createTransactionAction(formData) {
  const user = await requireUser(["manager", "staff"]);
  return finish(
    await createTransaction(user, {
      type: formData.get("type"),
      trx_date: formData.get("trx_date"),
      restock_order_id: formData.get("restock_order_id"),
      supplier_id: formData.get("supplier_id"),
      customer_name: formData.get("customer_name"),
      notes: formData.get("notes"),
      items: readItems(formData),
    })
  );
}

export async function updateTransactionAction(formData) {
  const user = await requireUser(["manager", "staff"]);
  const id = parseId(formData.get("id"));
  if (!id) return { errors: { id: "Invalid transaction" } };
  return finish(await updateTransaction(user, id, { notes: formData.get("notes"), items: readItems(formData) }));
}

export async function deleteTransactionAction(formData) {
  const user = await requireUser(["manager", "staff"]);
  const id = parseId(formData.get("id"));
  if (!id) return { errors: { id: "Invalid transaction" } };
  return finish(await deleteTransaction(user, id));
}

export async function changeTransactionStatusAction(formData) {
  const user = await requireUser(["manager", "staff"]);
  const id = parseId(formData.get("id"));
  if (!id) return { errors: { id: "Invalid transaction" } };
  return finish(await changeTransactionStatus(user, id, formData.get("status"), formData.get("reason")));
}
