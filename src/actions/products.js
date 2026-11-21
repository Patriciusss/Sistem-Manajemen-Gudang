"use server";

import { requireUser } from "@/lib/session";
import { createProduct, deleteProduct, updateProduct } from "@/lib/products";
import { actionResult, parseId } from "@/lib/api";

export async function createProductAction(formData) {
  await requireUser(["admin", "manager"]);
  return actionResult(await createProduct(Object.fromEntries(formData)));
}

export async function updateProductAction(formData) {
  await requireUser(["admin", "manager"]);
  const id = parseId(formData.get("id"));
  if (!id) return { errors: { id: "Invalid product" } };
  return actionResult(await updateProduct(id, Object.fromEntries(formData)), "Product not found");
}

export async function deleteProductAction(formData) {
  await requireUser(["admin", "manager"]);
  const id = parseId(formData.get("id"));
  if (!id) return { errors: { id: "Invalid product" } };
  return actionResult(await deleteProduct(id, formData.get("force") === "true"), "Product not found");
}
