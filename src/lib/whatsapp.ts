import { apiFetch, useApi } from "./api";

export type WhatsAppStatus = {
  configured: boolean;
  baseUrl: string;
  sender: string | null;
};

export type WablasMessageResult = {
  id: string;
  phone: string;
  message: string | null;
  caption?: string;
  image?: string;
  audio?: string;
  video?: string;
  document?: string;
  status: string;
  ref_id?: string | null;
};

export type WablasDeviceGroup = {
  device_id: string;
  quota: number | string;
  messages: WablasMessageResult[] | WablasMessageResult;
};

export type WablasSendResponse = {
  status: boolean;
  message?: string;
  error?: string;
  data?: WablasDeviceGroup | WablasDeviceGroup[];
};

// ────────────────────── Status ──────────────────────

export async function getWhatsAppStatus(): Promise<WhatsAppStatus> {
  if (!useApi) {
    return { configured: false, baseUrl: "", sender: null };
  }
  try {
    return await apiFetch<WhatsAppStatus>("/api/whatsapp/status");
  } catch {
    return { configured: false, baseUrl: "", sender: null };
  }
}

// ────────────────────── Personal sends ──────────────────────

export type TextSendItem = {
  phone: string;
  message: string;
  isGroup?: boolean;
  ref_id?: string;
  priority?: string;
  retry?: number;
  source?: string;
  flag?: string;
};

export type ImageSendItem = {
  phone: string;
  image: string;
  caption?: string;
  isGroup?: boolean;
  ref_id?: string;
};

export type AudioSendItem = {
  phone: string;
  audio: string;
  isGroup?: boolean;
  ref_id?: string;
};

export type VideoSendItem = {
  phone: string;
  video: string;
  caption: string;
  isGroup?: boolean;
  ref_id?: string;
};

export type DocumentSendItem = {
  phone: string;
  document: string;
  caption?: string;
  isGroup?: boolean;
  ref_id?: string;
};

export type LinkSendItem = {
  phone: string;
  text?: string;
  link: string;
  isGroup?: boolean;
};

export type ListSendItem = {
  phone: string;
  title: string;
  description: string;
  buttonText?: string;
  lists: { title: string; description: string }[];
  footer?: string;
  isGroup?: boolean;
};

export type LocationSendItem = {
  phone: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isGroup?: boolean;
};

export type SendType =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "document"
  | "link"
  | "list"
  | "location";

function requireApi() {
  if (!useApi) {
    throw new Error(
      "Backend API is not connected. Set VITE_API_URL and run the server.",
    );
  }
}

async function send<T>(
  path: string,
  items: T[],
): Promise<WablasSendResponse> {
  requireApi();
  return apiFetch<WablasSendResponse>(`/api/whatsapp/${path}`, {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export const sendText = (items: TextSendItem[]) => send("send/text", items);
export const sendImage = (items: ImageSendItem[]) => send("send/image", items);
export const sendAudio = (items: AudioSendItem[]) => send("send/audio", items);
export const sendVideo = (items: VideoSendItem[]) => send("send/video", items);
export const sendDocument = (items: DocumentSendItem[]) =>
  send("send/document", items);
export const sendLink = (items: LinkSendItem[]) => send("send/link", items);
export const sendList = (items: ListSendItem[]) => send("send/list", items);
export const sendLocation = (items: LocationSendItem[]) =>
  send("send/location", items);

// ────────────────────── Group sends ──────────────────────

export type GroupTextItem = { group_id: string; message: string };
export type GroupImageItem = {
  group_id: string;
  image: string;
  caption?: string;
};
export type GroupVideoItem = {
  group_id: string;
  video: string;
  caption: string;
};
export type GroupAudioItem = { group_id: string; audio: string };
export type GroupDocumentItem = {
  group_id: string;
  document: string;
  caption?: string;
};

export const sendGroupText = (items: GroupTextItem[]) =>
  send("group/text", items);
export const sendGroupImage = (items: GroupImageItem[]) =>
  send("group/image", items);
export const sendGroupVideo = (items: GroupVideoItem[]) =>
  send("group/video", items);
export const sendGroupAudio = (items: GroupAudioItem[]) =>
  send("group/audio", items);
export const sendGroupDocument = (items: GroupDocumentItem[]) =>
  send("group/document", items);

// ────────────────────── Schedule ──────────────────────

export type ScheduleCategory = "text" | "image" | "video" | "audio" | "document" | "template" | "button" | "location";

export type ScheduleItem = {
  category: ScheduleCategory;
  phone: string;
  scheduled_at: string;
  text?: unknown;
  url?: string;
};

export type ScheduleResponse = {
  status: boolean;
  message?: string;
  data?: {
    messages: {
      id: string;
      phone: string;
      messages: string;
      file: string | null;
      timezone: string;
      schedule_at: string;
    }[];
  };
};

export async function createSchedules(
  items: ScheduleItem[],
): Promise<ScheduleResponse> {
  requireApi();
  return apiFetch<ScheduleResponse>("/api/whatsapp/schedule", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export async function updateSchedule(
  id: string,
  items: ScheduleItem[],
): Promise<unknown> {
  requireApi();
  return apiFetch(`/api/whatsapp/schedule/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}

export async function deleteSchedules(ids: string[]): Promise<unknown> {
  requireApi();
  return apiFetch(
    `/api/whatsapp/schedule?id=${encodeURIComponent(ids.join(","))}`,
    { method: "DELETE" },
  );
}

// ────────────────────── Auto Reply ──────────────────────

export type AutoReplyRecord = {
  id: string;
  device: string;
  keyword: string;
  category?: string;
  response: string;
  file?: string | null;
};

export type AutoReplyListResponse = {
  status: boolean;
  message?: string;
  data?: AutoReplyRecord[];
};

export async function listAutoReply(
  keyword?: string,
): Promise<AutoReplyListResponse> {
  requireApi();
  const qs = keyword ? `?keyword=${encodeURIComponent(keyword)}` : "";
  return apiFetch<AutoReplyListResponse>(`/api/whatsapp/autoreply${qs}`);
}

export async function createAutoReply(input: {
  keyword: string;
  response: string;
}): Promise<unknown> {
  requireApi();
  return apiFetch("/api/whatsapp/autoreply", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAutoReply(
  id: string,
  input: { keyword: string; response: string },
): Promise<unknown> {
  requireApi();
  return apiFetch(`/api/whatsapp/autoreply/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteAutoReply(id: string): Promise<unknown> {
  requireApi();
  return apiFetch(`/api/whatsapp/autoreply/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ────────────────────── Contacts ──────────────────────

export type WablasContact = {
  id: string;
  phone: string;
  email?: string | null;
  name: string;
  nickname?: string | null;
  status?: string;
  address?: string | null;
  gender?: string | null;
  birth_day?: string | null;
  photo?: string | null;
  date?: { created_at: string; updated_at: string };
};

export type ContactListResponse = {
  status: boolean;
  totalData?: number;
  perPage?: number;
  page?: number;
  totalPage?: number;
  message?: WablasContact[] | string;
};

export type ContactInput = {
  phone: string;
  name: string;
  email?: string;
  address?: string;
  birth_day?: string;
};

export async function listContacts(params?: {
  phone?: string;
  page?: number;
  limit?: number;
}): Promise<ContactListResponse> {
  requireApi();
  const qs = new URLSearchParams();
  if (params?.phone) qs.set("phone", params.phone);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<ContactListResponse>(`/api/whatsapp/contacts${suffix}`);
}

export async function createContacts(items: ContactInput[]): Promise<unknown> {
  requireApi();
  return apiFetch("/api/whatsapp/contacts", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export async function updateContacts(items: ContactInput[]): Promise<unknown> {
  requireApi();
  return apiFetch("/api/whatsapp/contacts", {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}

export async function deleteContacts(phones: string[]): Promise<unknown> {
  requireApi();
  return apiFetch(
    `/api/whatsapp/contacts?phone=${encodeURIComponent(phones.join(","))}`,
    { method: "DELETE" },
  );
}

// ────────────────────── Agents ──────────────────────

export type AgentInput = {
  name: string;
  phone: string;
  email: string;
  password: string;
};

export async function createAgents(items: AgentInput[]): Promise<unknown> {
  requireApi();
  return apiFetch("/api/whatsapp/agents", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

// ────────────────────── Media ──────────────────────

export async function deleteMedia(id: string): Promise<unknown> {
  requireApi();
  return apiFetch(`/api/whatsapp/media/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ────────────────────── Helpers ──────────────────────

export function flattenWablasMessages(
  response: WablasSendResponse,
): WablasMessageResult[] {
  if (!response.data) return [];
  const groups = Array.isArray(response.data) ? response.data : [response.data];
  return groups.flatMap((g) => {
    const m = (g as WablasDeviceGroup).messages;
    if (!m) return [];
    return Array.isArray(m) ? m : [m];
  });
}

export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return digits;
}

export function renderTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => {
    const v = vars[k];
    return v == null ? "" : v;
  });
}
