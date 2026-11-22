"use server";

import { requireUser } from "@/lib/session";
import { resetPassword } from "@/lib/users";
import { actionResult, parseId } from "@/lib/api";

export async function resetPasswordAction(formData) {
  await requireUser(["admin"]);
  const id = parseId(formData.get("id"));
  if (!id) return { errors: { id: "Invalid user" } };
  return actionResult(await resetPassword(id, formData.get("password")), "User not found");
}
