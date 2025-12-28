import { cookies } from "next/headers";
import { verifyToken } from "./jwt";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;

  try {
    // FIX 1: Add 'await' (verifyToken is async now)
    const payload = await verifyToken(token);

    // FIX 2: Remove Database calls. 
    // We trust the token directly since we signed it with our server secret.
    // This matches the new Login system we set up.

    return { 
      id: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  } catch (error) {
    return null;
  }
}