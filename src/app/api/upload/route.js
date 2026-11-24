import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { authorize } from "@/lib/session";
import { invalid, serverError } from "@/lib/api";

const extensions = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_SIZE = 2 * 1024 * 1024;

export async function POST(request) {
  const { error } = await authorize(["admin", "manager"]);
  if (error) return error;
  try {
    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!file || typeof file === "string" || !extensions[file.type]) {
      return invalid({ file: "Image must be JPEG, PNG, or WebP" });
    }
    if (file.size > MAX_SIZE) return invalid({ file: "Image must be 2 MB or smaller" });
    const name = `${crypto.randomUUID()}.${extensions[file.type]}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ path: `/uploads/${name}` }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
