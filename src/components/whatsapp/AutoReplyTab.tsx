import { useCallback, useEffect, useState } from "react";
import { MessageSquareText, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import {
  ErrorAlert,
  Field,
  PrimaryButton,
  SecondaryButton,
  SuccessAlert,
  TextInput,
  Textarea,
} from "./common";
import {
  createAutoReply,
  deleteAutoReply,
  listAutoReply,
  updateAutoReply,
  type AutoReplyRecord,
} from "@/lib/whatsapp";

export default function AutoReplyTab({ canCall }: { canCall: boolean }) {
  const [items, setItems] = useState<AutoReplyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [keyword, setKeyword] = useState("");
  const [response, setResponse] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!canCall) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listAutoReply();
      setItems(res.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [canCall]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const reset = () => {
    setEditingId(null);
    setKeyword("");
    setResponse("");
  };

  const save = async () => {
    if (!keyword.trim() || !response.trim()) {
      setError("Keyword and response are required");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingId) {
        await updateAutoReply(editingId, { keyword, response });
        setSuccess(`Updated "${keyword}"`);
      } else {
        await createAutoReply({ keyword, response });
        setSuccess(`Created "${keyword}"`);
      }
      reset();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, kw: string) => {
    setError(null);
    setSuccess(null);
    try {
      await deleteAutoReply(id);
      setSuccess(`Deleted "${kw}"`);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const startEdit = (r: AutoReplyRecord) => {
    setEditingId(r.id);
    setKeyword(r.keyword);
    setResponse(r.response);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title={editingId ? "Edit auto reply" : "Create auto reply"}
          subtitle="Wablas will reply automatically when a keyword is matched"
          actions={
            editingId ? (
              <SecondaryButton onClick={reset}>Cancel edit</SecondaryButton>
            ) : null
          }
        />
        <CardBody>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-4">
              <Field label="Keyword" required>
                <TextInput
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="hello"
                />
              </Field>
            </div>
            <div className="col-span-12 md:col-span-8">
              <Field label="Response" required>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={3}
                  placeholder="Hi! How can we help?"
                />
              </Field>
            </div>
          </div>
          <PrimaryButton
            onClick={save}
            disabled={!canCall}
            loading={saving}
            className="mt-3"
          >
            <Plus className="h-4 w-4" />
            {editingId ? "Save changes" : "Create auto reply"}
          </PrimaryButton>

          <ErrorAlert error={error} />
          <SuccessAlert message={success} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Active auto replies"
          subtitle="Loaded from Wablas"
          actions={
            <SecondaryButton onClick={() => void refresh()}>
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </SecondaryButton>
          }
        />
        <CardBody>
          {loading ? (
            <div className="py-8 text-center text-xs text-ink-muted">Loading…</div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-bg-muted/30 py-10 text-center">
              <MessageSquareText className="h-8 w-8 text-ink-faint" />
              <p className="mt-2 text-xs text-ink-muted">No auto replies</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-line">
              <table className="w-full text-sm">
                <thead className="bg-bg-muted text-left text-xs uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="px-3 py-2">Keyword</th>
                    <th className="px-3 py-2">Response</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-2 font-medium">{r.keyword}</td>
                      <td className="max-w-[480px] px-3 py-2 text-ink-soft">
                        <div className="line-clamp-2">{r.response}</div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => startEdit(r)}
                            className="inline-flex items-center gap-1 rounded-md border border-line bg-bg-surface px-2 py-1 text-xs text-ink-soft hover:bg-bg-muted"
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => remove(r.id, r.keyword)}
                            className="inline-flex items-center gap-1 rounded-md border border-line bg-bg-surface px-2 py-1 text-xs text-bad hover:bg-bg-muted"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
