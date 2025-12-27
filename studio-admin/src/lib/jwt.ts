import jwt from "jsonwebtoken";
import { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

export function signToken(payload: JwtPayload, expiresIn = "7d") {
  const options: SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
