import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email ?? "") || (password ?? "").length < 6) {
      return NextResponse.json({ message: "Name, valid email, and password (min 6 characters) are required" }, { status: 400 });
    }
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, email, password, role, status) VALUES ($1, $2, $3, 'supplier', 'Pending')",
      [name.trim(), email.trim().toLowerCase(), hash]
    );
    return NextResponse.json({ message: "Registration successful. Please wait for admin approval." }, { status: 201 });
  } catch (error) {
    if (error.code === "23505") return NextResponse.json({ message: "Email is already registered" }, { status: 409 });
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
