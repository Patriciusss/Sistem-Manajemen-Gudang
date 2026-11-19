import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import crypto from "crypto";
import pool from "@/lib/db";

const COOKIE_NAME = "session";
const MAX_AGE = 60 * 60 * 24;

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  await pool.query("DELETE FROM sessions WHERE expires_at < NOW()");
  await pool.query(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 day')",
    [hashToken(token), userId]
  );
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.role FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > NOW() AND u.status = 'Approved'`,
    [hashToken(token)]
  );
  return rows[0] ?? null;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) await pool.query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
  store.delete(COOKIE_NAME);
}

export async function requireUser(roles) {
  const user = await getSession();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect(`/${user.role}`);
  return user;
}

export async function authorize(roles) {
  const user = await getSession();
  if (!user) return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  if (!roles.includes(user.role)) return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  return { user };
}
