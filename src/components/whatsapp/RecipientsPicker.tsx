import { useMemo, useState } from "react";
import { Users, XCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { usePartners } from "@/context/PartnersContext";
import { normalizePhone } from "@/lib/whatsapp";

export type Recipient = {
  id: string;
  name: string;
  phone: string;
  source: "partner" | "manual";
};

export default function RecipientsPicker({
  recipients,
  onChange,
  max = 100,
}: {
  recipients: Recipient[];
  onChange: (next: Recipient[]) => void;
  max?: number;
}) {
  const { records } = usePartners();
  const [search, setSearch] = useState("");
  const [manualInput, setManualInput] = useState("");

  const partnersWithPhone = useMemo(
    () => records.filter((r) => r.phone && r.phone.trim().length > 0),
    [records],
  );

  const filteredPartners = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return partnersWithPhone;
    return partnersWithPhone.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q),
    );
  }, [partnersWithPhone, search]);

  const selectedPartnerIds = useMemo(
    () =>
      new Set(
        recipients
          .filter((r) => r.source === "partner")
          .map((r) => r.id.replace(/^partner:/, "")),
      ),
    [recipients],
  );

  const togglePartner = (id: string) => {
    const partner = partnersWithPhone.find((p) => p.id === id);
    if (!partner) return;
    const rec: Recipient = {
      id: `partner:${id}`,
      name: partner.name,
      phone: normalizePhone(partner.phone),
      source: "partner",
    };
    if (selectedPartnerIds.has(id)) {
      onChange(recipients.filter((r) => r.id !== rec.id));
    } else {
      onChange(dedupe([...recipients, rec]));
    }
  };

  const selectAllVisible = () => {
    const additions = filteredPartners.map<Recipient>((p) => ({
      id: `partner:${p.id}`,
      name: p.name,
      phone: normalizePhone(p.phone),
      source: "partner",
    }));
    onChange(dedupe([...recipients, ...additions]));
  };

  const clearAll = () => onChange([]);

  const removeRecipient = (rec: Recipient) => {
    onChange(recipients.filter((r) => r.id !== rec.id));
  };

  const addManualNumbers = () => {
    if (!manualInput.trim()) return;
    const tokens = manualInput
      .split(/[,;\n]/)
      .map((t) => t.trim())
      .filter(Boolean);
    const newOnes: Recipient[] = tokens
      .map((token) => {
        const [phonePart, ...nameParts] = token.split("|");
        const phone = normalizePhone(phonePart);
        const name = nameParts.join("|").trim() || "Manual";
        return { phone, name };
      })
      .filter((x) => x.phone)
      .map((x) => ({
        id: `manual:${x.phone}`,
        name: x.name,
        phone: x.phone,
        source: "manual" as const,
      }));
    onChange(dedupe([...recipients, ...newOnes]));
    setManualInput("");
  };

  return (
    <Card>
      <CardHeader
        title="Recipients"
        subtitle={`${recipients.length} selected · max ${max} per send`}
        actions={
          <Badge tone={recipients.length > max ? "bad" : "mute"}>
            {recipients.length}/{max}
          </Badge>
        }
      />
      <CardBody>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search partners by name, phone, or role"
            className="flex-1 min-w-[200px] rounded-lg border border-line bg-bg-surface px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={selectAllVisible}
            className="rounded-lg border border-line bg-bg-surface px-3 py-2 text-xs font-medium text-ink-soft hover:bg-bg-muted"
          >
            Select all visible
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg border border-line bg-bg-surface px-3 py-2 text-xs font-medium text-ink-soft hover:bg-bg-muted"
          >
            Clear
          </button>
        </div>

        <div className="max-h-[260px] overflow-auto rounded-xl border border-line">
          {filteredPartners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="h-8 w-8 text-ink-faint" />
              <p className="mt-2 text-xs text-ink-muted">
                {partnersWithPhone.length === 0
                  ? "No partners with phone numbers yet. Add them in Project Monitoring → Master Data."
                  : "No matches"}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {filteredPartners.map((r) => (
                <li key={r.id}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-bg-muted/60",
                      selectedPartnerIds.has(r.id) && "bg-blue-50",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPartnerIds.has(r.id)}
                      onChange={() => togglePartner(r.id)}
                      className="h-4 w-4 rounded border-line accent-blue-600"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{r.name}</div>
                      <div className="truncate text-xs text-ink-muted">
                        {r.type} · {normalizePhone(r.phone)}
                      </div>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-ink-soft">
            Add numbers manually
          </label>
          <div className="mt-1 flex gap-2">
            <input
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="08123456789 | John,  6285xxxx | Jane"
              className="flex-1 rounded-lg border border-line bg-bg-surface px-3 py-2 text-sm outline-none focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addManualNumbers();
                }
              }}
            />
            <button
              type="button"
              onClick={addManualNumbers}
              className="rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white hover:bg-ink/90"
            >
              Add
            </button>
          </div>
          <p className="mt-1 text-[11px] text-ink-faint">
            Format: <code>phone | name</code>. Separate multiple by comma, semicolon, or new line.
          </p>
        </div>

        {recipients.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 text-xs font-medium text-ink-soft">
              Active recipients ({recipients.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recipients.map((r) => (
                <span
                  key={r.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-surface py-1 pl-2.5 pr-1 text-xs"
                >
                  <span className="font-medium">{r.name}</span>
                  <span className="text-ink-muted">{r.phone}</span>
                  <button
                    onClick={() => removeRecipient(r)}
                    className="ml-0.5 grid h-5 w-5 place-items-center rounded-full text-ink-muted hover:bg-bg-muted hover:text-ink"
                    aria-label={`Remove ${r.name}`}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function dedupe(list: Recipient[]): Recipient[] {
  const map = new Map<string, Recipient>();
  list.forEach((r) => {
    if (!r.phone) return;
    if (!map.has(r.phone)) map.set(r.phone, r);
  });
  return Array.from(map.values());
}
