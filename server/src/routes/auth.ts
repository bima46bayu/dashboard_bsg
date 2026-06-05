import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db.js";

const router = Router();

const JWT_SECRET =
  process.env.JWT_SECRET ?? "atlas-dev-secret-change-in-production";
const JWT_EXPIRES = process.env.JWT_EXPIRES ?? "7d";

type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: string;
};

function toPublicUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
  };
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  try {
    const { rows } = await query<UserRow>(
      `SELECT id, email, name, password_hash, role FROM users WHERE email = $1`,
      [String(email).trim().toLowerCase()],
    );
    const user = rows[0];
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES as jwt.SignOptions["expiresIn"] },
    );

    res.json({
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as {
      sub: string;
    };
    const { rows } = await query<UserRow>(
      `SELECT id, email, name, password_hash, role FROM users WHERE id = $1`,
      [payload.sub],
    );
    if (!rows[0]) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    res.json({ user: toPublicUser(rows[0]) });
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
});

export default router;
