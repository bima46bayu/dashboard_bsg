import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  PARTNER_STORAGE_KEY,
  nextPartnerId,
  type PartnerRecord,
  type PartnerTabKey,
  type PartnerType,
  filterPartners,
} from "@/data/partners";
import { apiFetch, useApi } from "@/lib/api";

type PartnersContextValue = {
  records: PartnerRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addRecord: (record: Omit<PartnerRecord, "id"> & { id?: string }) => Promise<void>;
  updateRecord: (record: PartnerRecord) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  customers: PartnerRecord[];
  bowheers: PartnerRecord[];
  subkons: PartnerRecord[];
  accountManagers: PartnerRecord[];
  projectManagers: PartnerRecord[];
  getNextId: () => string;
};

const PartnersContext = createContext<PartnersContextValue | null>(null);

function loadRecords(): PartnerRecord[] {
  try {
    const raw = localStorage.getItem(PARTNER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PartnerRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecords(records: PartnerRecord[]) {
  localStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(records));
}

export function PartnersProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<PartnerRecord[]>(
    useApi ? [] : loadRecords,
  );
  const [loading, setLoading] = useState(useApi);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!useApi) {
      setRecords(loadRecords());
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<PartnerRecord[]>("/api/partners");
      setRecords(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load partners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addRecord = useCallback(
    async (record: Omit<PartnerRecord, "id"> & { id?: string }) => {
      if (useApi) {
        const created = await apiFetch<PartnerRecord>("/api/partners", {
          method: "POST",
          body: JSON.stringify(record),
        });
        setRecords((prev) => [...prev, created]);
        return;
      }
      const id = record.id ?? nextPartnerId(records);
      const full = { ...record, id } as PartnerRecord;
      setRecords((prev) => {
        const next = [...prev, full];
        saveRecords(next);
        return next;
      });
    },
    [records],
  );

  const updateRecord = useCallback(async (record: PartnerRecord) => {
    if (useApi) {
      const updated = await apiFetch<PartnerRecord>(
        `/api/partners/${encodeURIComponent(record.id)}`,
        { method: "PUT", body: JSON.stringify(record) },
      );
      setRecords((prev) =>
        prev.map((r) => (r.id === record.id ? updated : r)),
      );
      return;
    }
    setRecords((prev) => {
      const next = prev.map((r) => (r.id === record.id ? record : r));
      saveRecords(next);
      return next;
    });
  }, []);

  const deleteRecord = useCallback(async (id: string) => {
    if (useApi) {
      await apiFetch(`/api/partners/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setRecords((prev) => prev.filter((r) => r.id !== id));
      return;
    }
    setRecords((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveRecords(next);
      return next;
    });
  }, []);

  const value = useMemo<PartnersContextValue>(
    () => ({
      records,
      loading,
      error,
      refresh,
      addRecord,
      updateRecord,
      deleteRecord,
      customers: filterPartners(records, "customers"),
      bowheers: filterPartners(records, "bowheers"),
      subkons: filterPartners(records, "subkons"),
      accountManagers: filterPartners(
        records,
        "managers",
        "ACCOUNT MANAGER",
      ),
      projectManagers: filterPartners(
        records,
        "managers",
        "PROJECT MANAGER",
      ),
      getNextId: () => nextPartnerId(records),
    }),
    [records, loading, error, refresh, addRecord, updateRecord, deleteRecord],
  );

  return (
    <PartnersContext.Provider value={value}>
      {children}
    </PartnersContext.Provider>
  );
}

export function usePartners() {
  const ctx = useContext(PartnersContext);
  if (!ctx) {
    throw new Error("usePartners must be used within PartnersProvider");
  }
  return ctx;
}

export type { PartnerRecord, PartnerTabKey, PartnerType };
