import { FileText, Clock, CheckSquare, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import StatCard from "@/components/ui/StatCard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import {
  Card,
  CardBody,
  CardHeader,
  FilterChip,
} from "@/components/ui/Card";
import { formatNumber } from "@/lib/format";
import { makeSeries } from "@/data/mock";

type Doc = {
  id: string;
  name: string;
  type: string;
  owner: string;
  status: "Draft" | "Review" | "Approved" | "Expired";
  updated: string;
  size: string;
};

const docs: Doc[] = [
  { id: "DOC-2104", name: "Q2 Vendor Master Agreement.pdf", type: "Contract", owner: "Finance", status: "Approved", updated: "May 10", size: "1.4 MB" },
  { id: "DOC-2103", name: "Compliance Audit Report 2026.docx", type: "Report", owner: "Compliance", status: "Review", updated: "May 09", size: "820 KB" },
  { id: "DOC-2102", name: "Asset Tagging Policy v3.docx", type: "Policy", owner: "Ops", status: "Draft", updated: "May 08", size: "612 KB" },
  { id: "DOC-2101", name: "Insurance Certificate FY26.pdf", type: "Certificate", owner: "Finance", status: "Expired", updated: "May 01", size: "240 KB" },
  { id: "DOC-2100", name: "Brand Guidelines 2026.pdf", type: "Brand", owner: "Marketing", status: "Approved", updated: "Apr 28", size: "4.2 MB" },
];

const tone = { Draft: "neutral", Review: "warn", Approved: "good", Expired: "bad" } as const;

const cols: Column<Doc>[] = [
  {
    key: "name",
    header: "Document",
    render: (r) => (
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-bg-muted text-ink-soft">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <div className="font-medium text-ink">{r.name}</div>
          <div className="text-xs text-ink-muted">
            {r.id} · {r.type}
          </div>
        </div>
      </div>
    ),
  },
  { key: "owner", header: "Owner", render: (r) => r.owner },
  {
    key: "status",
    header: "Status",
    render: (r) => <Badge tone={tone[r.status]}>{r.status}</Badge>,
  },
  { key: "updated", header: "Updated", align: "right", render: (r) => r.updated },
  { key: "size", header: "Size", align: "right", render: (r) => r.size },
];

export default function DocumentPage() {
  return (
    <>
      <PageHeader
        title="Document"
        subtitle="Repository, version control, and approvals"
        actions={
          <>
            <FilterChip label="All folders" />
            <FilterChip label="All owners" />
          </>
        }
      />
      <div className="grid grid-cols-12 gap-4">
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Total Documents"
          value={formatNumber(4_820)}
          delta={1.4}
          series={makeSeries(20, 50, 6, 3)}
          icon={<FileText className="h-4 w-4" />}
          accent="sky"
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Pending Approvals"
          value="22"
          delta={-2.0}
          series={makeSeries(20, 50, 10, 8)}
          icon={<CheckSquare className="h-4 w-4" />}
          accent="peach"
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Expiring (30d)"
          value="9"
          delta={1.2}
          series={makeSeries(20, 50, 12, 18, 0.3)}
          icon={<Clock className="h-4 w-4" />}
          accent="rose"
        />
        <StatCard
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          label="Access Violations"
          value="0"
          delta={0}
          series={makeSeries(20, 50, 4, 28)}
          icon={<ShieldAlert className="h-4 w-4" />}
          accent="mint"
        />

        <Card className="col-span-12 lg:col-span-8">
          <CardHeader
            title="Recent Documents"
            actions={
              <div className="flex items-center gap-2">
                <FilterChip label="Status: any" />
                <FilterChip label="Sort: Updated" />
              </div>
            }
          />
          <CardBody className="pt-2">
            <DataTable<Doc> rows={docs} columns={cols} />
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardHeader title="Approval Queue" />
          <CardBody className="pt-2 space-y-3">
            <Item
              title="Vendor Contract — Globex"
              who="Awaiting Finance Lead"
              age="2d"
              tone="warn"
            />
            <Item
              title="HR Policy update v2"
              who="Awaiting Legal"
              age="1d"
              tone="warn"
            />
            <Item
              title="Marketing Plan FY26"
              who="Awaiting CMO"
              age="4h"
              tone="info"
            />
            <Item
              title="Maintenance SLA — CNC"
              who="Awaiting Ops Lead"
              age="6h"
              tone="info"
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function Item({
  title,
  who,
  age,
  tone,
}: {
  title: string;
  who: string;
  age: string;
  tone: "info" | "warn" | "bad";
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line/70 p-3">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-ink-muted">{who}</div>
      </div>
      <Badge tone={tone}>{age}</Badge>
    </div>
  );
}
