import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ?? "atlas-dev-secret-change-in-production";

export type AuthPayload = {
  sub: string;
  email: string;
  role: string;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as AuthPayload;
    (req as Request & { auth?: AuthPayload }).auth = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}
