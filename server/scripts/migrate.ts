import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { pool } from "../src/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "../migrations");

async function main() {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sqlPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(sqlPath, "utf8");
    await pool.query(sql);
    console.log("Migration applied:", file);
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
