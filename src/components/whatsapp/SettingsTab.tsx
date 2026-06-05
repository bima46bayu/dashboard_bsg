import { useState } from "react";
import { FileX, Plus, Trash2, UserCog } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import {
  ErrorAlert,
  Field,
  PrimaryButton,
  SuccessAlert,
  TextInput,
} from "./common";
import {
  createAgents,
  deleteMedia,
  normalizePhone,
  type AgentInput,
  type WhatsAppStatus,
} from "@/lib/whatsapp";

const EMPTY: AgentInput = { name: "", phone: "", email: "", password: "" };

export default function SettingsTab({
  status,
  canCall,
}: {
  status: WhatsAppStatus | null;
  canCall: boolean;
}) {
  const [agents, setAgents] = useState<AgentInput[]>([{ ...EMPTY }]);
  const [savingAgents, setSavingAgents] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [agentSuccess, setAgentSuccess] = useState<string | null>(null);

  const [mediaId, setMediaId] = useState("");
  const [deletingMedia, setDeletingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaSuccess, setMediaSuccess] = useState<string | null>(null);

  const updateAgent = (i: number, patch: Partial<AgentInput>) =>
    setAgents((as) => as.map((a, j) => (j === i ? { ...a, ...patch } : a)));

  const addAgent = () => setAgents((as) => [...as, { ...EMPTY }]);
  const removeAgent = (i: number) =>
    setAgents((as) => (as.length === 1 ? as : as.filter((_, j) => j !== i)));

  const saveAgents = async () => {
    const cleaned = agents
      .map((a) => ({ ...a, phone: normalizePhone(a.phone) }))
      .filter((a) => a.name && a.phone && a.email && a.password);
    if (cleaned.length === 0) {
      setAgentError("Fill name, phone, email, and password for at least one agent");
      return;
    }
    setSavingAgents(true);
    setAgentError(null);
    setAgentSuccess(null);
    try {
      await createAgents(cleaned);
      setAgentSuccess(`Created ${cleaned.length} agent(s)`);
      setAgents([{ ...EMPTY }]);
    } catch (e) {
      setAgentError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSavingAgents(false);
    }
  };

  const removeMedia = async () => {
    if (!mediaId.trim()) {
      setMediaError("Media ID is required");
      return;
    }
    setDeletingMedia(true);
    setMediaError(null);
    setMediaSuccess(null);
    try {
      await deleteMedia(mediaId.trim());
      setMediaSuccess(`Removed media ${mediaId}`);
      setMediaId("");
    } catch (e) {
      setMediaError(e instanceof Error ? e.message : "Failed");
    } finally {
      setDeletingMedia(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Connection" subtitle="Server-side Wablas configuration" />
        <CardBody>
          <dl className="grid grid-cols-12 gap-y-2 text-sm">
            <dt className="col-span-4 text-ink-muted">Status</dt>
            <dd className="col-span-8 font-medium">
              {status?.configured ? "Connected" : "Not configured"}
            </dd>
            <dt className="col-span-4 text-ink-muted">Base URL</dt>
            <dd className="col-span-8 font-mono text-xs">
              {status?.baseUrl || "—"}
            </dd>
            <dt className="col-span-4 text-ink-muted">Sender</dt>
            <dd className="col-span-8">{status?.sender || "—"}</dd>
          </dl>
          <p className="mt-3 text-[11px] text-ink-faint">
            Credentials live in <code>server/.env</code> as{" "}
            <code>WABLAS_TOKEN</code> and <code>WABLAS_SECRET_KEY</code>. Restart
            the API after changes.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Create agents"
          subtitle="POST /api/v2/create-agent — up to 50 per request"
        />
        <CardBody>
          <div className="space-y-3">
            {agents.map((a, i) => (
              <div
                key={i}
                className="grid grid-cols-12 items-end gap-2 rounded-xl border border-line bg-bg-surface p-3"
              >
                <div className="col-span-12 md:col-span-3">
                  <Field label="Name" required>
                    <TextInput
                      value={a.name}
                      onChange={(e) => updateAgent(i, { name: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="col-span-12 md:col-span-3">
                  <Field label="Phone" required>
                    <TextInput
                      value={a.phone}
                      onChange={(e) => updateAgent(i, { phone: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="col-span-12 md:col-span-3">
                  <Field label="Email" required>
                    <TextInput
                      type="email"
                      value={a.email}
                      onChange={(e) => updateAgent(i, { email: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="col-span-10 md:col-span-2">
                  <Field label="Password" required>
                    <TextInput
                      type="password"
                      value={a.password}
                      onChange={(e) =>
                        updateAgent(i, { password: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="col-span-2 md:col-span-1 flex justify-end">
                  <button
                    onClick={() => removeAgent(i)}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-muted hover:bg-bg-muted"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addAgent}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              + Add agent
            </button>
          </div>

          <PrimaryButton
            onClick={saveAgents}
            disabled={!canCall}
            loading={savingAgents}
            className="mt-3"
          >
            <UserCog className="h-4 w-4" />
            Create agents
          </PrimaryButton>

          <ErrorAlert error={agentError} />
          <SuccessAlert message={agentSuccess} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Delete media"
          subtitle="DELETE /api/v2/media/delete/{id}"
        />
        <CardBody>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 md:col-span-8">
              <Field
                label="Media ID"
                hint="Message ID returned from the send API"
                required
              >
                <TextInput
                  value={mediaId}
                  onChange={(e) => setMediaId(e.target.value)}
                  placeholder="8ad7ecc7-d019-4305-9bc9-550605e5b816"
                />
              </Field>
            </div>
            <div className="col-span-12 md:col-span-4 flex items-end">
              <PrimaryButton
                onClick={removeMedia}
                disabled={!canCall}
                loading={deletingMedia}
                className="w-full"
              >
                <Plus className="h-4 w-4" />
                Delete
              </PrimaryButton>
            </div>
          </div>
          {!mediaError && !mediaSuccess && (
            <div className="mt-2 flex items-center gap-2 text-[11px] text-ink-faint">
              <FileX className="h-3.5 w-3.5" />
              Removes the file backing a previously sent media message.
            </div>
          )}
          <ErrorAlert error={mediaError} />
          <SuccessAlert message={mediaSuccess} />
        </CardBody>
      </Card>
    </div>
  );
}
