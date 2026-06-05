import { type FormEvent, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Field, Select, TextInput } from "@/components/monitoring/FormField";
import MultiSelect from "@/components/monitoring/MultiSelect";
import { usePartners } from "@/context/PartnersContext";
import { useProjects } from "@/context/ProjectsContext";

function PartnerHint({
  label,
  tab,
}: {
  label: string;
  tab: "customers" | "bowheers" | "subkons" | "managers";
}) {
  return (
    <p className="mt-1 text-[11px] text-ink-muted">
      No {label} yet.{" "}
      <Link
        to="/project/monitoring/master"
        className="font-medium text-blue-600 hover:underline"
      >
        Add in People &amp; Partners
      </Link>
      {tab === "managers" ? " (Account & Project Managers tab)" : ""}
    </p>
  );
}

function toOptions(list: { id: string; name: string }[]) {
  return list.map((p) => ({ value: p.id, label: p.name }));
}

export default function MonitoringNewProjectPage() {
  const navigate = useNavigate();
  const { getNextId, addProject } = useProjects();
  const {
    records: partners,
    customers,
    bowheers,
    subkons,
    accountManagers,
    projectManagers,
  } = usePartners();

  const projectId = getNextId();

  const [submitted, setSubmitted] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDate, setProjectDate] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [bowheerId, setBowheerId] = useState("");
  const [subkonIds, setSubkonIds] = useState<string[]>([]);
  const [accountManagerId, setAccountManagerId] = useState("");
  const [projectManagerIds, setProjectManagerIds] = useState<string[]>([]);

  function partnerName(id: string) {
    return partners.find((p) => p.id === id)?.name ?? "–";
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const pmNames = projectManagerIds
      .map((id) => partnerName(id))
      .filter((n) => n !== "–");
    await addProject({
      id: projectId,
      name: projectName.trim() || "Untitled Project",
      customer: partnerName(customerId),
      pm: pmNames.length > 0 ? pmNames.join(", ") : "–",
      value: 0,
      date: projectDate || new Date().toISOString().slice(0, 10),
      status: "Draft",
    });
    setSubmitted(true);
    setTimeout(() => navigate("/project/monitoring"), 800);
  }

  return (
    <>
      <div className="mb-5 flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate("/project/monitoring")}
          className="mt-1 grid h-8 w-8 place-items-center rounded-lg border border-line bg-white text-ink-soft transition-colors hover:bg-bg-muted"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Register New Project
          </h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            Fill in the main project details to register
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-line bg-white p-6 shadow-soft"
      >
        <div className="grid grid-cols-12 gap-x-5 gap-y-4">
          <Field
            className="col-span-12 md:col-span-4"
            label="Project ID"
            required
            hint="Auto generated"
          >
            <TextInput value={projectId} disabled readOnly />
          </Field>
          <Field
            className="col-span-12 md:col-span-4"
            label="Tanggal Project"
            required
          >
            <TextInput
              type="date"
              value={projectDate}
              onChange={(e) => setProjectDate(e.target.value)}
              required
            />
          </Field>
          <Field
            className="col-span-12 md:col-span-4"
            label="SPK/PO No"
            required
          >
            <TextInput placeholder="SPK/PO Number" />
          </Field>

          <Field
            className="col-span-12 md:col-span-8"
            label="Nama Project"
            required
          >
            <TextInput
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </Field>
          <Field
            className="col-span-12 md:col-span-4"
            label="Jenis Project"
            required
          >
            <Select defaultValue="">
              <option value="" disabled>
                -- Select Jenis Project --
              </option>
              <option value="construction">Construction</option>
              <option value="maintenance">Maintenance</option>
              <option value="installation">Installation</option>
              <option value="consulting">Consulting</option>
            </Select>
          </Field>

          <Field
            className="col-span-12 md:col-span-8"
            label="Lokasi Project"
            required
          >
            <TextInput placeholder="Project Location" />
          </Field>
          <Field
            className="col-span-12 md:col-span-4"
            label="Customer"
            required
          >
            <Select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              disabled={customers.length === 0}
            >
              <option value="" disabled>
                -- Select Customer --
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {customers.length === 0 && (
              <PartnerHint label="customers" tab="customers" />
            )}
          </Field>

          <Field
            className="col-span-12 md:col-span-4"
            label="Bowheer"
            required
          >
            <Select
              value={bowheerId}
              onChange={(e) => setBowheerId(e.target.value)}
              disabled={bowheers.length === 0}
            >
              <option value="" disabled>
                -- Select Bowheer --
              </option>
              {bowheers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
            {bowheers.length === 0 && (
              <PartnerHint label="bowheers" tab="bowheers" />
            )}
          </Field>
          <Field
            className="col-span-12 md:col-span-8"
            label="Subkon"
            hint="optional"
          >
            <MultiSelect
              options={toOptions(subkons)}
              value={subkonIds}
              onChange={setSubkonIds}
              placeholder="Select one or more subcons..."
            />
            {subkons.length === 0 && (
              <PartnerHint label="subkons" tab="subkons" />
            )}
          </Field>

          <Field
            className="col-span-12 md:col-span-4"
            label="Nilai Project"
            helpBelow="Nilai Project is automatically calculated from the sum of Total Harga in BOQ"
          >
            <TextInput
              value="Will be calculated from BOQ Total Harga"
              disabled
              readOnly
            />
          </Field>
          <Field
            className="col-span-12 md:col-span-4"
            label="Account Manager (A/M)"
            required
          >
            <Select
              value={accountManagerId}
              onChange={(e) => setAccountManagerId(e.target.value)}
              disabled={accountManagers.length === 0}
            >
              <option value="" disabled>
                -- Select Account Manager --
              </option>
              {accountManagers.map((am) => (
                <option key={am.id} value={am.id}>
                  {am.name}
                </option>
              ))}
            </Select>
            {accountManagers.length === 0 && (
              <PartnerHint label="account managers" tab="managers" />
            )}
          </Field>
          <div className="hidden md:col-span-4 md:block" />

          <Field
            className="col-span-12"
            label="Project Manager(s) (P/M)"
            required
          >
            <MultiSelect
              options={toOptions(projectManagers)}
              value={projectManagerIds}
              onChange={setProjectManagerIds}
              placeholder="Select project managers..."
            />
            {projectManagers.length === 0 && (
              <PartnerHint label="project managers" tab="managers" />
            )}
          </Field>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-5">
          {submitted && (
            <span className="text-xs font-medium text-good">
              Project registered (mock)
            </span>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            Register Project
          </button>
        </div>
      </form>
    </>
  );
}
