"use server";

import { requireUser } from "@/lib/session";
import { createCategory, deleteCategory, updateCategory } from "@/lib/categories";
import { actionResult, parseId } from "@/lib/api";

export async function createCategoryAction(formData) {
  await requireUser(["admin", "manager"]);
  return actionResult(await createCategory(Object.fromEntries(formData)));
}

export async function updateCategoryAction(formData) {
  await requireUser(["admin", "manager"]);
  const id = parseId(formData.get("id"));
  if (!id) return { errors: { id: "Invalid category" } };
  return actionResult(await updateCategory(id, Object.fromEntries(formData)), "Category not found");
}

export async function deleteCategoryAction(formData) {
  await requireUser(["admin", "manager"]);
  const id = parseId(formData.get("id"));
  if (!id) return { errors: { id: "Invalid category" } };
  return actionResult(await deleteCategory(id), "Category not found");
}
