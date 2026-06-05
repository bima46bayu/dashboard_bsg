import { Router } from "express";
import { query } from "../db.js";
import { nextPrefixedId } from "../ids.js";

type PartnerRow = {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  tab: string;
};

const router = Router();

function toPartner(row: PartnerRow) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    email: row.email,
    phone: row.phone,
    tab: row.tab,
  };
}

router.get("/", async (_req, res) => {
  const { rows } = await query<PartnerRow>(
    "SELECT id, name, type, email, phone, tab FROM partners ORDER BY created_at ASC",
  );
  res.json(rows.map(toPartner));
});

router.get("/next-id", async (_req, res) => {
  const { rows } = await query<{ id: string }>("SELECT id FROM partners");
  res.json({ id: nextPrefixedId("MD", rows.map((r) => r.id)) });
});

router.post("/", async (req, res) => {
  const { name, type, email, phone, tab } = req.body ?? {};
  if (!name || !type || !tab) {
    res.status(400).json({ error: "name, type, and tab are required" });
    return;
  }
  const { rows: existing } = await query<{ id: string }>("SELECT id FROM partners");
  const id = req.body?.id ?? nextPrefixedId("MD", existing.map((r) => r.id));

  const { rows } = await query<PartnerRow>(
    `INSERT INTO partners (id, name, type, email, phone, tab)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, type, email, phone, tab`,
    [id, name, type, email ?? "", phone ?? "", tab],
  );
  res.status(201).json(toPartner(rows[0]));
});

router.put("/:id", async (req, res) => {
  const { name, type, email, phone, tab } = req.body ?? {};
  const { rows } = await query<PartnerRow>(
    `UPDATE partners
     SET name = COALESCE($2, name),
         type = COALESCE($3, type),
         email = COALESCE($4, email),
         phone = COALESCE($5, phone),
         tab = COALESCE($6, tab),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, type, email, phone, tab`,
    [req.params.id, name, type, email, phone, tab],
  );
  if (!rows[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(toPartner(rows[0]));
});

router.delete("/:id", async (req, res) => {
  const result = await query("DELETE FROM partners WHERE id = $1", [
    req.params.id,
  ]);
  if (result.rowCount === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.status(204).send();
});

export default router;
