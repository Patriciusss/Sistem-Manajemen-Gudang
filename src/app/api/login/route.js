import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { createSession } from "@/lib/session";

const blocked = {
  Pending: "Your account is under review by admin",
  Rejected: "Your account registration was rejected",
};

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const { rows } = await pool.query(
      "SELECT id, password, role, status FROM users WHERE email = $1",
      [(email ?? "").trim().toLowerCase()]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password ?? "", user.password))) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }
    if (user.status !== "Approved") {
      return NextResponse.json({ message: blocked[user.status] }, { status: 403 });
    }
    await createSession(user.id);
    return NextResponse.json({ role: user.role });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
