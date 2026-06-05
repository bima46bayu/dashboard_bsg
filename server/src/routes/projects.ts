import { Router } from "express";
import { query } from "../db.js";
import { nextPrefixedId } from "../ids.js";

type ProjectRow = {
  id: string;
  name: string;
  customer: string;
  pm: string;
  value: string;
  project_date: Date;
  status: string;
};

const router = Router();

function toProject(row: ProjectRow) {
  const d =
    row.project_date instanceof Date
      ? row.project_date.toISOString().slice(0, 10)
      : String(row.project_date).slice(0, 10);
  return {
    id: row.id,
    name: row.name,
    customer: row.customer,
    pm: row.pm,
    value: Number(row.value),
    date: d,
    status: row.status,
  };
}

router.get("/", async (_req, res) => {
  const { rows } = await query<ProjectRow>(
    `SELECT id, name, customer, pm, value, project_date, status
     FROM projects ORDER BY created_at DESC`,
  );
  res.json(rows.map(toProject));
});

router.get("/next-id", async (_req, res) => {
  const { rows } = await query<{ id: string }>("SELECT id FROM projects");
  res.json({ id: nextPrefixedId("TPN", rows.map((r) => r.id)) });
});

router.post("/", async (req, res) => {
  const { name, customer, pm, value, date, status } = req.body ?? {};
  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }
  const { rows: existing } = await query<{ id: string }>("SELECT id FROM projects");
  const id = req.body?.id ?? nextPrefixedId("TPN", existing.map((r) => r.id));

  const { rows } = await query<ProjectRow>(
    `INSERT INTO projects (id, name, customer, pm, value, project_date, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, customer, pm, value, project_date, status`,
    [
      id,
      name,
      customer ?? "",
      pm ?? "",
      value ?? 0,
      date ?? new Date().toISOString().slice(0, 10),
      status ?? "Draft",
    ],
  );
  res.status(201).json(toProject(rows[0]));
});

export default router;
