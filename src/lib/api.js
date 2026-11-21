import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const invalid = (errors, status = 400) =>
  NextResponse.json({ message: "Validation failed", errors }, { status });

export const notFound = () => NextResponse.json({ message: "Not found" }, { status: 404 });

export function serverError(error) {
  console.error(error);
  return NextResponse.json({ message: "Server error" }, { status: 500 });
}

export function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function respond(result, status = 200) {
  if (result.status === 404) return notFound();
  if (result.errors) return invalid(result.errors, result.status);
  return NextResponse.json({ data: result.data }, { status });
}

export function actionResult(result, notFoundMessage = "Not found") {
  if (result.status === 404) return { errors: { id: notFoundMessage } };
  if (result.errors) return { errors: result.errors };
  revalidatePath("/", "layout");
  return { ok: true };
}
