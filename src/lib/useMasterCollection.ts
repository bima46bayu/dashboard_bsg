import { useCallback, useEffect, useState } from "react";
import { apiFetch, useApi } from "./api";

export type MasterRecord = {
  id: string;
  name: string;
  satuan: string;
  description: string;
  category: string;
};

export type MasterInput = Omit<MasterRecord, "id"> & { id?: string };

function loadLocal(storageKey: string): MasterRecord[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MasterRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocal(storageKey: string, records: MasterRecord[]) {
  localStorage.setItem(storageKey, JSON.stringify(records));
}

function nextLocalId(prefix: string, records: MasterRecord[]) {
  const maxN = records.reduce((acc, r) => {
    const n = Number(r.id.replace(`${prefix}-`, ""));
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `${prefix}-${String(maxN + 1).padStart(4, "0")}`;
}

export function useMasterCollection(opts: {
  apiPath: string;
  storageKey: string;
  idPrefix: string;
}) {
  const { apiPath, storageKey, idPrefix } = opts;

  const [records, setRecords] = useState<MasterRecord[]>(
    useApi ? [] : () => loadLocal(storageKey),
  );
  const [loading, setLoading] = useState(useApi);
  const [error, setError] = useState<string | null>(null);
  const [cachedNextId, setCachedNextId] = useState(`${idPrefix}-0001`);

  const refresh = useCallback(async () => {
    if (!useApi) {
      const local = loadLocal(storageKey);
      setRecords(local);
      setCachedNextId(nextLocalId(idPrefix, local));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<MasterRecord[]>(apiPath);
      setRecords(data);
      const { id } = await apiFetch<{ id: string }>(`${apiPath}/next-id`);
      setCachedNextId(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [apiPath, storageKey, idPrefix]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addRecord = useCallback(
    async (input: MasterInput) => {
      if (useApi) {
        const created = await apiFetch<MasterRecord>(apiPath, {
          method: "POST",
          body: JSON.stringify(input),
        });
        setRecords((prev) => [...prev, created]);
        const { id } = await apiFetch<{ id: string }>(`${apiPath}/next-id`);
        setCachedNextId(id);
        return created;
      }
      const id = input.id ?? nextLocalId(idPrefix, records);
      const full: MasterRecord = { ...input, id };
      const next = [...records, full];
      setRecords(next);
      saveLocal(storageKey, next);
      setCachedNextId(nextLocalId(idPrefix, next));
      return full;
    },
    [apiPath, storageKey, idPrefix, records],
  );

  const updateRecord = useCallback(
    async (record: MasterRecord) => {
      if (useApi) {
        const updated = await apiFetch<MasterRecord>(
          `${apiPath}/${encodeURIComponent(record.id)}`,
          { method: "PUT", body: JSON.stringify(record) },
        );
        setRecords((prev) =>
          prev.map((r) => (r.id === record.id ? updated : r)),
        );
        return;
      }
      const next = records.map((r) => (r.id === record.id ? record : r));
      setRecords(next);
      saveLocal(storageKey, next);
    },
    [apiPath, storageKey, records],
  );

  const deleteRecord = useCallback(
    async (id: string) => {
      if (useApi) {
        await apiFetch(`${apiPath}/${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        setRecords((prev) => prev.filter((r) => r.id !== id));
        return;
      }
      const next = records.filter((r) => r.id !== id);
      setRecords(next);
      saveLocal(storageKey, next);
      setCachedNextId(nextLocalId(idPrefix, next));
    },
    [apiPath, storageKey, idPrefix, records],
  );

  return {
    records,
    loading,
    error,
    refresh,
    addRecord,
    updateRecord,
    deleteRecord,
    nextId: cachedNextId,
  };
}
