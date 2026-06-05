export type MonitoringProject = {
  id: string;
  name: string;
  customer: string;
  pm: string;
  value: number;
  date: string;
  status: "Draft" | "Active" | "On Hold" | "Closed";
};

export const PROJECT_STORAGE_KEY = "atlas-monitoring-projects-v1";

export function nextProjectId(projects: MonitoringProject[]) {
  const maxN = projects.reduce((acc, p) => {
    const n = Number(p.id.replace("TPN-", ""));
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `TPN-${String(maxN + 1).padStart(4, "0")}`;
}
