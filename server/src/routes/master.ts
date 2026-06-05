import { Router } from "express";
import { query } from "../db.js";
import { nextPrefixedId } from "../ids.js";

type MasterRow = {
  id: string;
  name: string;
  satuan: string;
  description: string;
  category: string;
};

function toRecord(row: MasterRow) {
  return {
    id: row.id,
    name: row.name,
    satuan: row.satuan,
    description: row.description,
    category: row.category,
  };
}

export function masterRouter(table: string, idPrefix: string): Router {
  if (!/^[a-z_]+$/.test(table)) {
    throw new Error(`Invalid table name: ${table}`);
  }
  const router = Router();

  router.get("/", async (_req, res) => {
    const { rows } = await query<MasterRow>(
      `SELECT id, name, satuan, description, category
       FROM ${table} ORDER BY created_at ASC`,
    );
    res.json(rows.map(toRecord));
  });

  router.get("/next-id", async (_req, res) => {
    const { rows } = await query<{ id: string }>(`SELECT id FROM ${table}`);
    res.json({ id: nextPrefixedId(idPrefix, rows.map((r) => r.id)) });
  });

  router.post("/", async (req, res) => {
    const { name, satuan, description, category } = req.body ?? {};
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const { rows: existing } = await query<{ id: string }>(
      `SELECT id FROM ${table}`,
    );
    const id =
      req.body?.id ?? nextPrefixedId(idPrefix, existing.map((r) => r.id));

    const { rows } = await query<MasterRow>(
      `INSERT INTO ${table} (id, name, satuan, description, category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, satuan, description, category`,
      [id, name, satuan ?? "", description ?? "", category ?? ""],
    );
    res.status(201).json(toRecord(rows[0]));
  });

  router.put("/:id", async (req, res) => {
    const { name, satuan, description, category } = req.body ?? {};
    const { rows } = await query<MasterRow>(
      `UPDATE ${table}
       SET name = COALESCE($2, name),
           satuan = COALESCE($3, satuan),
           description = COALESCE($4, description),
           category = COALESCE($5, category),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, satuan, description, category`,
      [req.params.id, name, satuan, description, category],
    );
    if (!rows[0]) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(toRecord(rows[0]));
  });

  router.delete("/:id", async (req, res) => {
    const result = await query(`DELETE FROM ${table} WHERE id = $1`, [
      req.params.id,
    ]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).send();
  });

  return router;
}
