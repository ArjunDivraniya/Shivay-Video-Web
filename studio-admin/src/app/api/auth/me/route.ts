import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get("cookie");
    const token = cookie
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("admin_token="))
      ?.split("=")[1];

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    await dbConnect();
    const admin = (await Admin.findById(payload.sub).lean()) as any;
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.json({ email: admin.email, role: admin.role });
  } catch (error: any) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
