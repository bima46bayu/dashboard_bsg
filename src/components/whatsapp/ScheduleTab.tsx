import { useEffect, useState } from "react";
import { CalendarClock, Plus, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
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
  createSchedules,
  deleteSchedules,
  type ScheduleCategory,
  type ScheduleItem,
} from "@/lib/whatsapp";
import { cn } from "@/lib/cn";

const CATEGORIES: { value: ScheduleCategory; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "document", label: "Document" },
  { value: "location", label: "Location" },
];

const STORAGE_KEY = "atlas-wa-schedules-v1";

type StoredSchedule = {
  id: string;
  category: ScheduleCategory;
  phone: string;
  scheduled_at: string;
  text: string;
  url?: string;
  created_at: string;
};

function load(): StoredSchedule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSchedule[]) : [];
  } catch {
    return [];
  }
}

function save(list: StoredSchedule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
}

export default function ScheduleTab({ canCall }: { canCall: boolean }) {
  const [category, setCategory] = useState<ScheduleCategory>("text");
  const [phone, setPhone] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [list, setList] = useState<StoredSchedule[]>(load);

  useEffect(() => save(list), [list]);

  const formatForApi = (local: string): string => {
    if (!local) return "";
    return local.replace("T", " ") + (local.length === 16 ? ":00" : "");
  };

  const create = async () => {
    setError(null);
    setSuccess(null);
    if (!phone || !scheduledAt) {
      setError("Phone and scheduled date/time are required");
      return;
    }
    setCreating(true);
    try {
      const item: ScheduleItem = {
        category,
        phone: phone.replace(/\D/g, ""),
        scheduled_at: formatForApi(scheduledAt),
        text:
          category === "text" || category === "image" || category === "video" ||
          category === "audio" || category === "document"
            ? text
            : text,
        ...(category !== "text" ? { url } : {}),
      };
      const res = await createSchedules([item]);
      if (!res.status) {
        setError(res.message || "Wablas rejected the schedule");
        return;
      }
      const msg = res.data?.messages?.[0];
      if (msg) {
        const next: StoredSchedule = {
          id: msg.id,
          category,
          phone: msg.phone,
          scheduled_at: msg.schedule_at,
          text: typeof item.text === "string" ? item.text : "",
          url: item.url,
          created_at: new Date().toISOString(),
        };
        setList((prev) => [next, ...prev]);
        setSuccess(`Scheduled ${msg.id} for ${msg.schedule_at}`);
      } else {
        setSuccess("Scheduled successfully");
      }
      setText("");
      setUrl("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  };

  const remove = async (id: string) => {
    if (!canCall) return;
    setError(null);
    setSuccess(null);
    try {
      await deleteSchedules([id]);
      setList((prev) => prev.filter((s) => s.id !== id));
      setSuccess("Schedule deleted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Create scheduled message"
          subtitle="Wablas v2 schedules: text, image, video, audio, document, location"
        />
        <CardBody>
          <div className="mb-3 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  category === c.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-line bg-bg-surface text-ink-soft hover:bg-bg-muted",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-6">
              <Field label="Phone" required>
                <TextInput
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="6281xxxxxxxxx"
                />
              </Field>
            </div>
            <div className="col-span-12 md:col-span-6">
              <Field label="Scheduled at" required hint="Your local time">
                <TextInput
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </Field>
            </div>
            {category !== "text" && (
              <div className="col-span-12">
                <Field label="Media URL" required>
                  <TextInput
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://…"
                  />
                </Field>
              </div>
            )}
            <div className="col-span-12">
              <Field label={category === "text" ? "Message" : "Caption / text"}>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                />
              </Field>
            </div>
          </div>

          <PrimaryButton
            onClick={create}
            disabled={!canCall}
            loading={creating}
            className="mt-3"
          >
            <Plus className="h-4 w-4" />
            Create schedule
          </PrimaryButton>

          <ErrorAlert error={error} />
          <SuccessAlert message={success} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Tracked schedules"
          subtitle="Local copy of schedules you've created from this app"
          actions={
            list.length > 0 ? (
              <SecondaryButton onClick={() => setList([])}>
                <Trash2 className="h-3.5 w-3.5" />
                Clear list
              </SecondaryButton>
            ) : null
          }
        />
        <CardBody>
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-bg-muted/30 py-10 text-center">
              <CalendarClock className="h-8 w-8 text-ink-faint" />
              <p className="mt-2 text-xs text-ink-muted">
                No schedules yet
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-line">
              <table className="w-full text-sm">
                <thead className="bg-bg-muted text-left text-xs uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="px-3 py-2">Schedule ID</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">When</th>
                    <th className="px-3 py-2">Body</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {list.map((s) => (
                    <tr key={s.id}>
                      <td className="px-3 py-2 font-mono text-[11px] text-ink-muted">
                        {s.id}
                      </td>
                      <td className="px-3 py-2">
                        <Badge tone="mute">{s.category}</Badge>
                      </td>
                      <td className="px-3 py-2 num">{s.phone}</td>
                      <td className="px-3 py-2">{s.scheduled_at}</td>
                      <td className="max-w-[260px] truncate px-3 py-2 text-ink-soft">
                        {s.text || s.url || "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => remove(s.id)}
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
        </CardBody>
      </Card>
    </div>
  );
}
