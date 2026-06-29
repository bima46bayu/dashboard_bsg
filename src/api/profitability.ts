import { apiFetch, apiUrl } from "@/lib/api";
import { authHeaders } from "@/lib/auth";

export async function fetchProfitabilities(page: number = 1) {
  return await apiFetch<any>(`/api/profitabilities?page=${page}`);
}

export async function deleteProfitability(id: number) {
  return await apiFetch<any>(`/api/profitabilities/${id}`, {
    method: "DELETE",
  });
}

export async function saveProfitabilities(payload: any[]) {
  return await apiFetch<any>("/api/profitabilities", {
    method: "POST",
    body: JSON.stringify({ drafts: payload }),
  });
}

export async function updateProfitability(id: number, payload: any) {
  return await apiFetch<any>(`/api/profitabilities/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchProfitabilityDashboard(year?: number) {
  const url = year ? `/api/profitabilities/dashboard?year=${year}` : "/api/profitabilities/dashboard";
  return await apiFetch<any>(url);
}

export async function downloadProfitabilitiesExport() {
  const res = await fetch(apiUrl("/api/profitabilities/export"), {
    method: "GET",
    headers: {
      ...authHeaders(),
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Gagal mengunduh data");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "profitability_data.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadProfitabilitiesTemplate() {
  const res = await fetch(apiUrl("/api/profitabilities/export-template"), {
    method: "GET",
    headers: {
      ...authHeaders(),
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Gagal mengunduh template");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "profitability_template.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function importProfitabilitiesExcel(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(apiUrl("/api/profitabilities/import"), {
    method: "POST",
    headers: {
      ...authHeaders(),
      Accept: "application/json",
    },
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Gagal mengimpor data");
  }

  return res.json();
}
