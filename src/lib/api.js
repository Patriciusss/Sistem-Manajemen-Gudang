import { NextResponse } from "next/server";

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
