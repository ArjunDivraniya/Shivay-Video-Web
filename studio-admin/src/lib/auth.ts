import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import dbConnect from "./mongodb";
import Admin from "@/models/Admin";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;

  try {
    const payload = verifyToken(token);
    await dbConnect();
    const admin = await Admin.findById(payload.sub).lean();
    if (!admin) return null;
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch (error) {
    return null;
  }
}
