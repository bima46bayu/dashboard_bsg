import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import {
  ErrorAlert,
  Field,
  PrimaryButton,
  SecondaryButton,
  SuccessAlert,
  TextInput,
} from "./common";
import {
  createContacts,
  deleteContacts,
  listContacts,
  updateContacts,
  type ContactInput,
  type WablasContact,
} from "@/lib/whatsapp";
import { normalizePhone } from "@/lib/whatsapp";

const EMPTY: ContactInput = { phone: "", name: "" };

export default function ContactsTab({ canCall }: { canCall: boolean }) {
  const [contacts, setContacts] = useState<WablasContact[]>([]);
  const [meta, setMeta] = useState<{
    totalData: number;
    page: number;
    totalPage: number;
  }>({ totalData: 0, page: 1, totalPage: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");

  const [rows, setRows] = useState<ContactInput[]>([{ ...EMPTY }]);
  const [mode, setMode] = useState<"create" | "update">("create");
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!canCall) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listContacts({
        page,
        limit,
        phone: search.trim() || undefined,
      });
      const list = Array.isArray(res.message)
        ? (res.message as WablasContact[])
        : [];
      setContacts(list);
      setMeta({
        totalData: res.totalData ?? list.length,
        page: res.page ?? page,
        totalPage: res.totalPage ?? 1,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [canCall, page, limit, search]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateRow = (i: number, patch: Partial<ContactInput>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const addRow = () => setRows((rs) => [...rs, { ...EMPTY }]);
  const removeRow = (i: number) =>
    setRows((rs) => (rs.length === 1 ? rs : rs.filter((_, j) => j !== i)));

  const save = async () => {
    const cleaned = rows
      .map((r) => ({
        ...r,
        phone: normalizePhone(r.phone),
        name: r.name.trim(),
      }))
      .filter((r) => r.phone && r.name);
    if (cleaned.length === 0) {
      setError("Add at least one row with phone and name");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (mode === "create") {
        await createContacts(cleaned);
        setSuccess(`Submitted ${cleaned.length} contact(s) for creation`);
      } else {
        await updateContacts(cleaned);
        setSuccess(`Submitted ${cleaned.length} contact(s) for update`);
      }
      setRows([{ ...EMPTY }]);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const removeContact = async (phone: string) => {
    setError(null);
    setSuccess(null);
    try {
      await deleteContacts([phone]);
      setSuccess(`Deleted ${phone}`);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Wablas contacts"
          subtitle={`${meta.totalData} total · page ${meta.page} / ${meta.totalPage}`}
          actions={
            <SecondaryButton onClick={() => void refresh()}>
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </SecondaryButton>
          }
        />
        <CardBody>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <TextInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by phone"
              className="max-w-[260px]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  void refresh();
                }
              }}
            />
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-line bg-bg-surface px-3 py-2 text-sm"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.page <= 1}
                className="grid h-8 w-8 place-items-center rounded-md border border-line bg-bg-surface text-ink-soft hover:bg-bg-muted disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={meta.page >= meta.totalPage}
                className="grid h-8 w-8 place-items-center rounded-md border border-line bg-bg-surface text-ink-soft hover:bg-bg-muted disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-ink-muted">Loading…</div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-bg-muted/30 py-10 text-center">
              <Users className="h-8 w-8 text-ink-faint" />
              <p className="mt-2 text-xs text-ink-muted">No contacts</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-line">
              <table className="w-full text-sm">
                <thead className="bg-bg-muted text-left text-xs uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Birthday</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {contacts.map((c) => (
                    <tr key={c.id}>
                      <td className="px-3 py-2 font-medium">{c.name}</td>
                      <td className="px-3 py-2 num">{c.phone}</td>
                      <td className="px-3 py-2 text-ink-soft">
                        {c.email || "—"}
                      </td>
                      <td className="px-3 py-2 text-ink-soft">
                        {c.birth_day || "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => removeContact(c.phone)}
                          className="inline-flex items-center gap-1 rounded-md border border-line bg-bg-surface px-2 py-1 text-xs text-bad hover:bg-bg-muted"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <ErrorAlert error={error} />
          <SuccessAlert message={success} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={mode === "create" ? "Create contacts" : "Update contacts"}
          subtitle="Up to 500 rows per request"
          actions={
            <div className="inline-flex rounded-lg border border-line bg-bg-surface p-0.5 text-xs">
              <button
                onClick={() => setMode("create")}
                className={
                  "rounded-md px-3 py-1 " +
                  (mode === "create"
                    ? "bg-blue-600 text-white"
                    : "text-ink-soft hover:bg-bg-muted")
                }
              >
                Create
              </button>
              <button
                onClick={() => setMode("update")}
                className={
                  "rounded-md px-3 py-1 " +
                  (mode === "update"
                    ? "bg-blue-600 text-white"
                    : "text-ink-soft hover:bg-bg-muted")
                }
              >
                Update
              </button>
            </div>
          }
        />
        <CardBody>
          <div className="space-y-3">
            {rows.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-12 items-end gap-2 rounded-xl border border-line bg-bg-surface p-3"
              >
                <div className="col-span-12 md:col-span-3">
                  <Field label="Name" required>
                    <TextInput
                      value={row.name}
                      onChange={(e) => updateRow(i, { name: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="col-span-12 md:col-span-3">
                  <Field label="Phone" required>
                    <TextInput
                      value={row.phone}
                      onChange={(e) => updateRow(i, { phone: e.target.value })}
                      placeholder="6281xxxxxxxxx"
                    />
                  </Field>
                </div>
                <div className="col-span-12 md:col-span-3">
                  <Field label="Email">
                    <TextInput
                      value={row.email ?? ""}
                      onChange={(e) => updateRow(i, { email: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <Field label="Birthday">
                    <TextInput
                      type="date"
                      value={row.birth_day ?? ""}
                      onChange={(e) =>
                        updateRow(i, { birth_day: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="col-span-6 md:col-span-1 flex md:justify-end">
                  <button
                    onClick={() => removeRow(i)}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-muted hover:bg-bg-muted"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="col-span-12">
                  <Field label="Address">
                    <TextInput
                      value={row.address ?? ""}
                      onChange={(e) =>
                        updateRow(i, { address: e.target.value })
                      }
                    />
                  </Field>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addRow}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              + Add row
            </button>
          </div>

          <PrimaryButton
            onClick={save}
            disabled={!canCall}
            loading={saving}
            className="mt-3"
          >
            {mode === "create" ? (
              <>
                <UserPlus className="h-4 w-4" />
                Create
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Update
              </>
            )}
          </PrimaryButton>
        </CardBody>
      </Card>
    </div>
  );
}
