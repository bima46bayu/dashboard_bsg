import { useMemo, useState } from "react";
import { CheckCircle2, Send, XCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import {
  ErrorAlert,
  Field,
  PrimaryButton,
  TextInput,
  Textarea,
} from "./common";
import RecipientsPicker, {
  type Recipient,
} from "./RecipientsPicker";
import {
  flattenWablasMessages,
  renderTemplate,
  sendAudio,
  sendDocument,
  sendImage,
  sendLink,
  sendList,
  sendLocation,
  sendText,
  sendVideo,
  type SendType,
  type WablasMessageResult,
} from "@/lib/whatsapp";

const SEND_TYPES: { value: SendType; label: string; desc: string }[] = [
  { value: "text", label: "Text", desc: "Plain text broadcast" },
  { value: "image", label: "Image", desc: "Image URL + optional caption" },
  { value: "video", label: "Video", desc: "Video URL + caption" },
  { value: "audio", label: "Audio", desc: "Audio URL (mp3/ogg)" },
  { value: "document", label: "Document", desc: "PDF/DOC/etc by URL" },
  { value: "link", label: "Link preview", desc: "Rich link unfurl" },
  { value: "list", label: "Interactive list", desc: "Title + list rows" },
  { value: "location", label: "Location", desc: "Coordinates + name" },
];

export default function SendTab({ canCall }: { canCall: boolean }) {
  const [type, setType] = useState<SendType>("text");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResults, setLastResults] = useState<WablasMessageResult[]>([]);

  // shared
  const [message, setMessage] = useState(
    "Halo {{name}},\n\nKami punya penawaran spesial untuk Anda. Balas pesan ini untuk info lebih lanjut.\n\nSalam,\nTim Atlas",
  );
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  // link
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  // list
  const [listTitle, setListTitle] = useState("");
  const [listDesc, setListDesc] = useState("");
  const [listButton, setListButton] = useState("menu");
  const [listFooter, setListFooter] = useState("");
  const [listRows, setListRows] = useState<
    { title: string; description: string }[]
  >([{ title: "", description: "" }]);
  // location
  const [locName, setLocName] = useState("");
  const [locAddress, setLocAddress] = useState("");
  const [locLat, setLocLat] = useState("");
  const [locLng, setLocLng] = useState("");

  const preview = useMemo(() => {
    const first = recipients[0];
    return renderTemplate(message, { name: first?.name ?? "Customer" });
  }, [message, recipients]);

  const canSend = canCall && recipients.length > 0 && !sending;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    setError(null);
    setLastResults([]);
    try {
      let response;
      switch (type) {
        case "text":
          response = await sendText(
            recipients.map((r) => ({
              phone: r.phone,
              message: renderTemplate(message, { name: r.name }),
            })),
          );
          break;
        case "image":
          response = await sendImage(
            recipients.map((r) => ({
              phone: r.phone,
              image: mediaUrl,
              caption: renderTemplate(caption, { name: r.name }) || undefined,
            })),
          );
          break;
        case "audio":
          response = await sendAudio(
            recipients.map((r) => ({ phone: r.phone, audio: mediaUrl })),
          );
          break;
        case "video":
          response = await sendVideo(
            recipients.map((r) => ({
              phone: r.phone,
              video: mediaUrl,
              caption: renderTemplate(caption, { name: r.name }),
            })),
          );
          break;
        case "document":
          response = await sendDocument(
            recipients.map((r) => ({
              phone: r.phone,
              document: mediaUrl,
              caption: caption || undefined,
            })),
          );
          break;
        case "link":
          response = await sendLink(
            recipients.map((r) => ({
              phone: r.phone,
              text: renderTemplate(linkText, { name: r.name }),
              link: linkUrl,
            })),
          );
          break;
        case "list":
          response = await sendList(
            recipients.map((r) => ({
              phone: r.phone,
              title: renderTemplate(listTitle, { name: r.name }),
              description: renderTemplate(listDesc, { name: r.name }),
              buttonText: listButton,
              lists: listRows.filter((row) => row.title || row.description),
              footer: listFooter,
            })),
          );
          break;
        case "location":
          response = await sendLocation(
            recipients.map((r) => ({
              phone: r.phone,
              name: locName,
              address: locAddress,
              latitude: Number(locLat),
              longitude: Number(locLng),
            })),
          );
          break;
      }
      if (response && !response.status) {
        setError(response.error || response.message || "Wablas rejected the request");
      }
      if (response) {
        setLastResults(flattenWablasMessages(response));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Message type" subtitle="Wablas v2 supports 8 message kinds" />
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {SEND_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  type === t.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-line bg-bg-surface text-ink-soft hover:bg-bg-muted",
                )}
                title={t.desc}
              >
                {t.label}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7">
          <RecipientsPicker recipients={recipients} onChange={setRecipients} />
        </div>

        <Card className="col-span-12 lg:col-span-5">
          <CardHeader
            title="Compose"
            subtitle="Use {{name}} to personalize text fields per recipient"
          />
          <CardBody>
            {type === "text" && (
              <Field label="Message" required>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={9}
                />
              </Field>
            )}

            {(type === "image" || type === "video" || type === "audio" || type === "document") && (
              <div className="space-y-3">
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
                  hint="Must be a publicly accessible URL"
                  required
                >
                  <TextInput
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://…"
                  />
                </Field>
                {type !== "audio" && (
                  <Field
                    label="Caption"
                    required={type === "video"}
                    hint={type === "video" ? "Required for video" : undefined}
                  >
                    <Textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      rows={4}
                      placeholder={`Hi {{name}}…`}
                    />
                  </Field>
                )}
              </div>
            )}

            {type === "link" && (
              <div className="space-y-3">
                <Field label="Link URL" required>
                  <TextInput
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://wablas.com"
                  />
                </Field>
                <Field label="Text">
                  <Textarea
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    rows={4}
                    placeholder="Optional description"
                  />
                </Field>
              </div>
            )}

            {type === "list" && (
              <div className="space-y-3">
                <Field label="Title" required>
                  <TextInput
                    value={listTitle}
                    onChange={(e) => setListTitle(e.target.value)}
                  />
                </Field>
                <Field label="Description" required>
                  <Textarea
                    value={listDesc}
                    onChange={(e) => setListDesc(e.target.value)}
                    rows={3}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Button text" required>
                    <TextInput
                      value={listButton}
                      onChange={(e) => setListButton(e.target.value)}
                    />
                  </Field>
                  <Field label="Footer">
                    <TextInput
                      value={listFooter}
                      onChange={(e) => setListFooter(e.target.value)}
                    />
                  </Field>
                </div>
                <div>
                  <div className="mb-1 text-xs font-medium text-ink-soft">
                    List rows
                  </div>
                  <div className="space-y-2">
                    {listRows.map((row, i) => (
                      <div key={i} className="flex gap-2">
                        <TextInput
                          value={row.title}
                          onChange={(e) =>
                            setListRows((rows) =>
                              rows.map((r, j) =>
                                j === i ? { ...r, title: e.target.value } : r,
                              ),
                            )
                          }
                          placeholder="Row title"
                          className="w-1/3"
                        />
                        <TextInput
                          value={row.description}
                          onChange={(e) =>
                            setListRows((rows) =>
                              rows.map((r, j) =>
                                j === i ? { ...r, description: e.target.value } : r,
                              ),
                            )
                          }
                          placeholder="Row description"
                        />
                        <button
                          onClick={() =>
                            setListRows((rows) =>
                              rows.length === 1
                                ? rows
                                : rows.filter((_, j) => j !== i),
                            )
                          }
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-ink-muted hover:bg-bg-muted"
                          aria-label="Remove row"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setListRows((rows) => [
                          ...rows,
                          { title: "", description: "" },
                        ])
                      }
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      + Add row
                    </button>
                  </div>
                </div>
              </div>
            )}

            {type === "location" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Place name" required>
                    <TextInput
                      value={locName}
                      onChange={(e) => setLocName(e.target.value)}
                    />
                  </Field>
                  <Field label="Address">
                    <TextInput
                      value={locAddress}
                      onChange={(e) => setLocAddress(e.target.value)}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Latitude" required>
                    <TextInput
                      value={locLat}
                      onChange={(e) => setLocLat(e.target.value)}
                      placeholder="-6.200000"
                      inputMode="decimal"
                    />
                  </Field>
                  <Field label="Longitude" required>
                    <TextInput
                      value={locLng}
                      onChange={(e) => setLocLng(e.target.value)}
                      placeholder="106.816666"
                      inputMode="decimal"
                    />
                  </Field>
                </div>
              </div>
            )}

            {type === "text" && (
              <div className="mt-3 rounded-lg border border-line bg-bg-muted/40 p-3">
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                  Preview {recipients[0] ? `· for ${recipients[0].name}` : ""}
                </div>
                <div className="whitespace-pre-wrap text-sm text-ink">
                  {preview || (
                    <span className="text-ink-faint">Message preview…</span>
                  )}
                </div>
              </div>
            )}

            <PrimaryButton
              onClick={handleSend}
              disabled={!canSend}
              loading={sending}
              className="mt-4 w-full"
            >
              <Send className="h-4 w-4" />
              Send {type} to {recipients.length}{" "}
              {recipients.length === 1 ? "recipient" : "recipients"}
            </PrimaryButton>

            <ErrorAlert error={error} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Last send results"
          subtitle={
            lastResults.length === 0
              ? "Per-message status from Wablas appears here after sending"
              : `${lastResults.length} message${lastResults.length === 1 ? "" : "s"} processed`
          }
        />
        <CardBody>
          {lastResults.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-bg-muted/30 py-8 text-center text-xs text-ink-muted">
              No results yet
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-line">
              <table className="w-full text-sm">
                <thead className="bg-bg-muted text-left text-xs uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Message ID</th>
                    <th className="px-3 py-2">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {lastResults.map((r, idx) => {
                    const ok =
                      r.status === "pending" ||
                      r.status === "sent" ||
                      r.status === "queued";
                    return (
                      <tr key={`${r.id || idx}-${r.phone}`}>
                        <td className="px-3 py-2">
                          <Badge tone={ok ? "good" : "bad"}>
                            {ok ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            {r.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 num">{r.phone}</td>
                        <td className="px-3 py-2 font-mono text-[11px] text-ink-muted">
                          {r.id || "—"}
                        </td>
                        <td className="max-w-[360px] truncate px-3 py-2 text-ink-soft">
                          {r.message ||
                            r.caption ||
                            r.image ||
                            r.video ||
                            r.audio ||
                            r.document ||
                            "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
