import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validators";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { signToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);

    await dbConnect();
    const admin = await Admin.findOne({ email: parsed.email });
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(parsed.password, admin.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({ sub: admin._id.toString(), email: admin.email, role: admin.role });

    const response = NextResponse.json({ email: admin.email, role: admin.role, success: true });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 400 });
  }
}
