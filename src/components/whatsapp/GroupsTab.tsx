import { useState } from "react";
import { Send } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import {
  ErrorAlert,
  Field,
  PrimaryButton,
  SuccessAlert,
  TextInput,
  Textarea,
} from "./common";
import {
  sendGroupAudio,
  sendGroupDocument,
  sendGroupImage,
  sendGroupText,
  sendGroupVideo,
} from "@/lib/whatsapp";

const GROUP_TYPES = ["text", "image", "video", "audio", "document"] as const;
type GroupType = (typeof GROUP_TYPES)[number];

export default function GroupsTab({ canCall }: { canCall: boolean }) {
  const [type, setType] = useState<GroupType>("text");
  const [groupIds, setGroupIds] = useState("");
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSend = async () => {
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      const ids = groupIds
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (ids.length === 0) {
        throw new Error("Add at least one Wablas group ID");
      }
      let res;
      if (type === "text") {
        res = await sendGroupText(
          ids.map((group_id) => ({ group_id, message })),
        );
      } else if (type === "image") {
        res = await sendGroupImage(
          ids.map((group_id) => ({
            group_id,
            image: mediaUrl,
            caption: caption || undefined,
          })),
        );
      } else if (type === "video") {
        res = await sendGroupVideo(
          ids.map((group_id) => ({ group_id, video: mediaUrl, caption })),
        );
      } else if (type === "audio") {
        res = await sendGroupAudio(
          ids.map((group_id) => ({ group_id, audio: mediaUrl })),
        );
      } else {
        res = await sendGroupDocument(
          ids.map((group_id) => ({
            group_id,
            document: mediaUrl,
            caption: caption || undefined,
          })),
        );
      }
      if (res.status) {
        setSuccess(res.message || "Queued");
      } else {
        setError(res.error || res.message || "Wablas rejected the request");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Send to Wablas groups"
        subtitle="Send to Wablas phone groups (not WhatsApp groups). Group IDs come from your Wablas dashboard."
      />
      <CardBody>
        <div className="mb-4 flex flex-wrap gap-2">
          {GROUP_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                type === t
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-line bg-bg-surface text-ink-soft hover:bg-bg-muted",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-6">
            <Field
              label="Wablas group IDs"
              hint="Separate multiple by comma, semicolon, or new line"
              required
            >
              <Textarea
                value={groupIds}
                onChange={(e) => setGroupIds(e.target.value)}
                rows={5}
                placeholder="sdf18xxxxxx, asdsax11121"
              />
            </Field>
          </div>

          <div className="col-span-12 lg:col-span-6 space-y-3">
            {type === "text" && (
              <Field label="Message" required>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                />
              </Field>
            )}
            {type !== "text" && (
              <Field
                label={
                  type === "image"
                    ? "Image URL"
                    : type === "video"
                      ? "Video URL"
                      : type === "audio"
                        ? "Audio URL"
                        : "Document URL"
                }
                required
              >
                <TextInput
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://…"
                />
              </Field>
            )}
            {(type === "image" || type === "video" || type === "document") && (
              <Field label="Caption" required={type === "video"}>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                />
              </Field>
            )}
          </div>
        </div>

        <PrimaryButton
          onClick={handleSend}
          disabled={!canCall}
          loading={sending}
          className="mt-4"
        >
          <Send className="h-4 w-4" />
          Send to groups
        </PrimaryButton>

        <ErrorAlert error={error} />
        <SuccessAlert message={success} />
      </CardBody>
    </Card>
  );
}
