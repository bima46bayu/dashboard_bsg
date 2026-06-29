import { apiFetch } from "@/lib/api";

export type SalesDashboardData = {
  total_target: number;
  total_realization: number;
  overall_achievement_percentage: number;
  achievement_per_team: Array<{
    team: string;
    target: number;
    realization: number;
  }>;
  achievement_per_entity: Array<{
    entity: string;
    realization: number;
  }>;
  achievement_per_end_user: Array<{
    end_user: string;
    realization: number;
  }>;
  monthly_trend: Array<{
    month: number;
    target: number;
    realization: number;
  }>;
  top_sales: Array<{
    name: string;
    team: string;
    target: number;
    realization: number;
    achievement_percentage: number;
  }>;
  entity_trends_monthly: Array<{
    entity: string;
    data: Array<{ month: number; target: number; realization: number }>;
  }>;
  entity_trends_yearly: Array<{
    entity: string;
    data: Array<{ label: string; target: number; realization: number }>;
    years: number[];
  }>;
  yearly_trend: Array<{
    year: number;
    target: number;
    realization: number;
  }>;
  pivot_table: {
    by_am: any[];
    by_team: any[];
    by_entity: any[];
  };
  filter_meta: {
    year: number;
    curr_month: number;
    prev_month: number | null;
    pivot_curr_month: number;
    pivot_prev_month: number | null;
  };
};

export type MasterData = {
  teams: Array<{ id: number; name: string }>;
  entities: Array<{ id: number; name: string }>;
  sales_members: Array<{ id: number; name: string; team_id: number }>;
  end_users: Array<{ id: number; name: string }>;
};

export type SalesTarget = {
  id: number;
  year: number;
  month: number;
  sales_member_id: number;
  entity_id: number;
  end_user_id: number;
  target_amount: number;
  sales_member?: { id: number; name: string };
  entity?: { id: number; name: string };
  end_user?: { id: number; name: string };
};

export type SalesRealization = {
  id: number;
  year: number;
  month: number;
  sales_member_id: number;
  entity_id: number;
  end_user_id: number;
  realization_amount: number;
  sales_member?: { id: number; name: string };
  entity?: { id: number; name: string };
  end_user?: { id: number; name: string };
};

export async function fetchSalesDashboard(params?: Record<string, string | number>): Promise<SalesDashboardData> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) query.append(k, String(v));
    });
  }
  return apiFetch<SalesDashboardData>(`/api/sales/dashboard?${query.toString()}`);
}

export async function fetchMasterData(): Promise<MasterData> {
  return apiFetch<MasterData>("/api/sales/master-data");
}

export async function fetchTargets(page: number = 1, params?: Record<string, any>): Promise<{ data: SalesTarget[], current_page: number, last_page: number }> {
  const query = new URLSearchParams({ page: String(page) });
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) query.append(k, String(v));
    });
  }
  return apiFetch<{ data: SalesTarget[], current_page: number, last_page: number }>(`/api/sales/targets?${query.toString()}`);
}

export async function fetchRealizations(page: number = 1, params?: Record<string, any>): Promise<{ data: SalesRealization[], current_page: number, last_page: number }> {
  const query = new URLSearchParams({ page: String(page) });
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) query.append(k, String(v));
    });
  }
  return apiFetch<{ data: SalesRealization[], current_page: number, last_page: number }>(`/api/sales/realizations?${query.toString()}`);
}

export async function saveTargets(targets: any[]) {
  return apiFetch("/api/sales/targets", {
    method: "POST",
    body: JSON.stringify({ targets }),
  });
}

export async function saveRealizations(realizations: any[]) {
  return apiFetch("/api/sales/realizations", {
    method: "POST",
    body: JSON.stringify({ realizations }),
  });
}

export async function deleteTarget(id: number) {
  return apiFetch(`/api/sales/targets/${id}`, { method: "DELETE" });
}

export async function deleteRealization(id: number) {
  return apiFetch(`/api/sales/realizations/${id}`, { method: "DELETE" });
}

export async function updateTarget(id: number, data: any) {
  return apiFetch(`/api/sales/targets/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function updateRealization(id: number, data: any) {
  return apiFetch(`/api/sales/realizations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

import { apiUrl } from "@/lib/api";
import { authHeaders } from "@/lib/auth";

export async function importTargetsExcel(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(apiUrl("/api/sales/targets/import"), {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function importRealizationsExcel(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(apiUrl("/api/sales/realizations/import"), {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchMasterList(type: string, page: number = 1, search: string = "") {
  const q = new URLSearchParams({ page: page.toString() });
  if (search) q.append("search", search);
  return apiFetch<{ data: any[], current_page: number, last_page: number }>(`/api/sales/master/${type}?${q.toString()}`);
}

export async function saveMasterData(type: string, data: any) {
  return apiFetch(`/api/sales/master/${type}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMasterData(type: string, id: number, data: any) {
  return apiFetch(`/api/sales/master/${type}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteMasterData(type: string, id: number) {
  return apiFetch(`/api/sales/master/${type}/${id}`, { method: "DELETE" });
}
