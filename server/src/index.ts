import cors from "cors";
import express from "express";
import "dotenv/config";
import { pool } from "./db.js";
import partnersRouter from "./routes/partners.js";
import projectsRouter from "./routes/projects.js";
import { masterRouter } from "./routes/master.js";
import authRouter from "./routes/auth.js";
import whatsappRouter from "./routes/whatsapp.js";

const app = express();
const port = Number(process.env.PORT) || 3001;
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.use("/api/auth", authRouter);

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, database: "connected" });
  } catch {
    res.status(503).json({ ok: false, database: "disconnected" });
  }
});

app.use("/api/partners", partnersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/master-items", masterRouter("master_items", "ITEM"));
app.use(
  "/api/master-indirect-costs",
  masterRouter("master_indirect_costs", "INDIRECT"),
);
app.use("/api/whatsapp", whatsappRouter);

app.listen(port, () => {
  console.log(`Atlas API listening on http://localhost:${port}`);
});
