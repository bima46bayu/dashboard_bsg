import { apiFetch } from "@/lib/api";

export type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "viewer";
  is_active: boolean;
};

export async function fetchUsers(): Promise<{ data: User[] }> {
  return apiFetch<{ data: User[] }>("/api/users");
}

export async function saveUser(data: any): Promise<{ data: User }> {
  return apiFetch<{ data: User }>("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: number, data: any): Promise<{ data: User }> {
  return apiFetch<{ data: User }>(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: number): Promise<void> {
  return apiFetch(`/api/users/${id}`, { method: "DELETE" });
}
