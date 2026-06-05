import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Users,
  Building2,
  Handshake,
  HardHat,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Modal, { ModalButton } from "@/components/ui/Modal";
import { Field, Select, TextInput } from "@/components/monitoring/FormField";
import { cn } from "@/lib/cn";
import {
  usePartners,
  type PartnerRecord,
  type PartnerTabKey,
  type PartnerType,
} from "@/context/PartnersContext";

type TabKey = PartnerTabKey;
type PersonType = PartnerType;
type MasterRecord = PartnerRecord;

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: "managers", label: "Account & Project Managers", icon: Users },
  { key: "customers", label: "Customers", icon: Building2 },
  { key: "subkons", label: "Subkons", icon: Handshake },
  { key: "bowheers", label: "Bowheers", icon: HardHat },
  { key: "misc", label: "Misc", icon: MoreHorizontal },
];

const TAB_DEFAULT_TYPES: Record<TabKey, PersonType[]> = {
  managers: ["PROJECT MANAGER", "ACCOUNT MANAGER"],
  customers: ["CUSTOMER"],
  subkons: ["SUBKON"],
  bowheers: ["BOWHEER"],
  misc: ["MISC"],
};

const TYPE_STYLES: Record<PersonType, string> = {
  "PROJECT MANAGER": "bg-emerald-100 text-emerald-800",
  "ACCOUNT MANAGER": "bg-sky-100 text-sky-800",
  CUSTOMER: "bg-violet-100 text-violet-800",
  SUBKON: "bg-amber-100 text-amber-800",
  BOWHEER: "bg-orange-100 text-orange-800",
  MISC: "bg-bg-muted text-ink-soft",
};

export default function MonitoringMasterDataPage() {
  const { records, addRecord, updateRecord, deleteRecord, getNextId } =
    usePartners();
  const [tab, setTab] = useState<TabKey>("managers");
  const [typeFilter, setTypeFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MasterRecord | null>(null);

  const allowedTypes = TAB_DEFAULT_TYPES[tab];

  const filtered = useMemo(() => {
    let list = records.filter((r) => r.tab === tab);
    if (typeFilter) list = list.filter((r) => r.type === typeFilter);
    return list;
  }, [records, tab, typeFilter]);

  const filterOptions = useMemo(() => {
    if (tab === "managers") {
      return [
        { value: "", label: "All Types" },
        { value: "PROJECT MANAGER", label: "Project Manager" },
        { value: "ACCOUNT MANAGER", label: "Account Manager" },
      ];
    }
    return [{ value: "", label: "All Types" }];
  }, [tab]);

  const cols: Column<MasterRecord>[] = [
    {
      key: "name",
      header: "Name",
      render: (r) => <span className="font-semibold text-ink">{r.name}</span>,
    },
    {
      key: "type",
      header: "Type",
      render: (r) => (
        <span
          className={cn(
            "inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            TYPE_STYLES[r.type],
          )}
        >
          {r.type}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (r) => <span className="text-ink-soft">{r.email || "–"}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (r) => <span className="text-ink-soft">{r.phone || "–"}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <RowActions
          onEdit={() => {
            setEditing(r);
            setOpen(true);
          }}
          onDelete={() => deleteRecord(r.id)}
        />
      ),
    },
  ];

  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight">Master Data</h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          Manage Account Managers, Project Managers, Customers, and Subkons
        </p>
      </div>

      <div className="mb-4 border-b border-line">
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                setTypeFilter("");
              }}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                tab === t.key
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-ink-muted hover:text-ink",
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="type-filter" className="text-ink-soft">
            Filter:
          </label>
          <div className="w-48">
            <Select
              id="type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              disabled={tab !== "managers"}
            >
              {filterOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add New
        </button>
      </div>

      <div className="rounded-xl border border-line bg-white shadow-soft">
        {filtered.length === 0 ? (
          <EmptyState
            tab={tab}
            hasFilter={!!typeFilter}
            onAdd={() => {
              setEditing(null);
              setOpen(true);
            }}
          />
        ) : (
          <div className="px-5 py-1">
            <DataTable<MasterRecord> rows={filtered} columns={cols} />
          </div>
        )}
      </div>

      <RecordModal
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
        tab={tab}
        allowedTypes={allowedTypes}
        nextId={getNextId()}
        onSave={async (rec) => {
          if (editing) await updateRecord(rec);
          else await addRecord(rec);
          setOpen(false);
        }}
      />
    </>
  );
}

function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={onEdit}
        className="grid h-7 w-7 place-items-center rounded text-ink-muted transition-colors hover:bg-bg-muted hover:text-ink"
        aria-label="Edit"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="grid h-7 w-7 place-items-center rounded text-ink-muted transition-colors hover:bg-accent-rose hover:text-bad"
        aria-label="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function EmptyState({
  tab,
  hasFilter,
  onAdd,
}: {
  tab: TabKey;
  hasFilter: boolean;
  onAdd: () => void;
}) {
  const tabLabel = TABS.find((t) => t.key === tab)?.label ?? "records";
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-bg-muted text-ink-muted">
        <Users className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">
        {hasFilter ? "No matching records" : `No ${tabLabel.toLowerCase()} yet`}
      </h3>
      <p className="mt-1 max-w-sm text-xs text-ink-muted">
        {hasFilter
          ? "Try a different filter."
          : "Click Add New to create your first entry."}
      </p>
      {!hasFilter && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add New
        </button>
      )}
    </div>
  );
}

function RecordModal({
  open,
  onClose,
  editing,
  tab,
  allowedTypes,
  nextId: nextIdValue,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  editing: MasterRecord | null;
  tab: TabKey;
  allowedTypes: PersonType[];
  nextId: string;
  onSave: (rec: MasterRecord) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<PersonType>(allowedTypes[0]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? "");
    setType(editing?.type ?? allowedTypes[0]);
    setEmail(editing?.email ?? "");
    setPhone(editing?.phone ?? "");
  }, [open, editing, allowedTypes]);

  function reset() {
    setName(editing?.name ?? "");
    setType(editing?.type ?? allowedTypes[0]);
    setEmail(editing?.email ?? "");
    setPhone(editing?.phone ?? "");
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: editing?.id ?? nextIdValue,
      name: name.trim(),
      type,
      email: email.trim(),
      phone: phone.trim(),
      tab: editing?.tab ?? tab,
    });
    reset();
  }

  const showTypeSelect = allowedTypes.length > 1;

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      title={editing ? "Edit Record" : "Add New"}
      width="max-w-md"
    >
      <form onSubmit={submit} className="space-y-4 py-1">
        <Field label="Name" required>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </Field>
        {showTypeSelect ? (
          <Field label="Type" required>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as PersonType)}
            >
              {allowedTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
        <Field label="Email">
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </Field>
        <Field label="Phone">
          <TextInput
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+62 ..."
          />
        </Field>
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
          <ModalButton type="submit" variant="primary">
            {editing ? "Save" : "Create"}
          </ModalButton>
        </div>
      </form>
    </Modal>
  );
}
