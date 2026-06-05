import { useMemo, useState, type FormEvent } from "react";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Modal, { ModalButton } from "@/components/ui/Modal";
import {
  Field,
  Select,
  TextInput,
  Textarea,
} from "@/components/monitoring/FormField";
import {
  useMasterCollection,
  type MasterRecord,
} from "@/lib/useMasterCollection";

const CATEGORIES = ["Product", "Service", "Material", "Equipment"];

export default function MonitoringMasterItemPage() {
  const {
    records: items,
    loading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    nextId,
  } = useMasterCollection({
    apiPath: "/api/master-items",
    storageKey: "atlas-master-items-v1",
    idPrefix: "ITEM",
  });
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MasterRecord | null>(null);

  const filtered = useMemo(
    () => (filter ? items.filter((it) => it.category === filter) : items),
    [items, filter],
  );

  const cols: Column<MasterRecord>[] = [
    {
      key: "id",
      header: "Item ID",
      render: (r) => (
        <span className="font-mono text-xs text-ink-soft">{r.id}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (r) => <span className="font-semibold text-ink">{r.name}</span>,
    },
    { key: "satuan", header: "Satuan", render: (r) => r.satuan || "–" },
    {
      key: "description",
      header: "Description",
      render: (r) => r.description || "–",
    },
    { key: "category", header: "Category", render: (r) => r.category || "–" },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <div className="inline-flex items-center gap-1">
          <button
            onClick={() => {
              setEditing(r);
              setOpen(true);
            }}
            className="grid h-7 w-7 place-items-center rounded text-ink-muted transition-colors hover:bg-bg-muted hover:text-ink"
            aria-label="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => void deleteRecord(r.id)}
            className="grid h-7 w-7 place-items-center rounded text-ink-muted transition-colors hover:bg-accent-rose hover:text-bad"
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight">Master Item</h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          Manage items, materials, equipment, and services used in projects
        </p>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-accent-rose/60 bg-accent-rose/30 px-3 py-2 text-xs text-ink">
          {error}
        </div>
      )}

      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="filter-cat" className="text-ink-soft">
            Filter by Category:
          </label>
          <div className="w-48">
            <Select
              id="filter-cat"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Master Item
        </button>
      </div>

      <div className="rounded-xl border border-line bg-white shadow-soft">
        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-ink-muted">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            onAdd={() => {
              setEditing(null);
              setOpen(true);
            }}
            hasFilter={!!filter}
          />
        ) : (
          <div className="px-5 py-1">
            <DataTable<MasterRecord> rows={filtered} columns={cols} />
          </div>
        )}
      </div>

      <ItemModal
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
        nextId={nextId}
        onSave={async (it) => {
          if (editing) {
            await updateRecord(it);
          } else {
            await addRecord(it);
          }
          setOpen(false);
        }}
      />
    </>
  );
}

function EmptyState({
  onAdd,
  hasFilter,
}: {
  onAdd: () => void;
  hasFilter: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-bg-muted text-ink-muted">
        <Package className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">
        {hasFilter ? "No items in this category" : "No master items yet"}
      </h3>
      <p className="mt-1 max-w-sm text-xs text-ink-muted">
        {hasFilter
          ? "Try clearing the filter or pick a different category."
          : "Create your first master item to start building BOQs."}
      </p>
      {!hasFilter && (
        <button
          onClick={onAdd}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Master Item
        </button>
      )}
    </div>
  );
}

function ItemModal({
  open,
  onClose,
  editing,
  nextId,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  editing: MasterRecord | null;
  nextId: string;
  onSave: (it: MasterRecord) => Promise<void> | void;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [satuan, setSatuan] = useState(editing?.satuan ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [category, setCategory] = useState(editing?.category ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function reset() {
    setName(editing?.name ?? "");
    setSatuan(editing?.satuan ?? "");
    setDescription(editing?.description ?? "");
    setCategory(editing?.category ?? "");
    setErr(null);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      await onSave({
        id: editing?.id ?? nextId,
        name: name.trim(),
        satuan: satuan.trim(),
        description: description.trim(),
        category,
      });
      reset();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      title={editing ? "Edit Master Item" : "Add Master Item"}
      width="max-w-md"
    >
      <form id="item-form" onSubmit={submit} className="space-y-4 py-1">
        <Field label="Item ID" required helpBelow="Item ID is auto-generated">
          <TextInput value={editing?.id ?? nextId} disabled readOnly />
        </Field>
        <Field label="Name" required>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </Field>
        <Field
          label="Satuan"
          helpBelow="Unit of measure; auto-selected in BOQ when this item is chosen"
        >
          <TextInput
            placeholder="e.g. lot, unit, pcs"
            value={satuan}
            onChange={(e) => setSatuan(e.target.value)}
          />
        </Field>
        <Field label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </Field>
        <Field label="Category">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">-- Select category --</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        {err && (
          <div className="rounded-md border border-accent-rose/60 bg-accent-rose/30 px-3 py-2 text-xs text-ink">
            {err}
          </div>
        )}
        <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
          <ModalButton
            type="button"
            onClick={() => {
              onClose();
              reset();
            }}
          >
            Cancel
          </ModalButton>
          <ModalButton type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save" : "Create"}
          </ModalButton>
        </div>
      </form>
    </Modal>
  );
}
