import { Router } from "express";

const router = Router();

const WABLAS_BASE_URL =
  process.env.WABLAS_BASE_URL ?? "https://solo.wablas.com";

function authHeader(): string | null {
  const token = process.env.WABLAS_TOKEN ?? "";
  const secret = process.env.WABLAS_SECRET_KEY ?? "";
  if (!token) return null;
  return secret ? `${token}.${secret}` : token;
}

async function wablas(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<{ status: number; payload: unknown }> {
  const auth = authHeader();
  if (!auth) {
    return {
      status: 503,
      payload: {
        status: false,
        error: "Wablas credentials not configured on the server",
      },
    };
  }
  try {
    const init: RequestInit = {
      method,
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
    };
    if (body !== undefined && method !== "GET") {
      init.body = JSON.stringify(body);
    }
    const res = await fetch(`${WABLAS_BASE_URL}${path}`, init);
    const text = await res.text();
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }
    return { status: res.ok ? 200 : res.status, payload };
  } catch (err) {
    return {
      status: 502,
      payload: {
        status: false,
        error: err instanceof Error ? err.message : "Failed to reach Wablas",
      },
    };
  }
}

function normalizePhone(input: unknown): string {
  return String(input ?? "").replace(/\D/g, "");
}

function ensureItemsArray(req: any, res: any, max = 100): unknown[] | null {
  const items = req.body?.items;
  if (!Array.isArray(items) || items.length === 0) {
    res
      .status(400)
      .json({ status: false, error: "items array is required" });
    return null;
  }
  if (items.length > max) {
    res.status(400).json({
      status: false,
      error: `Wablas v2 accepts up to ${max} items per request`,
    });
    return null;
  }
  return items;
}

router.get("/status", (_req, res) => {
  res.json({
    configured: Boolean(process.env.WABLAS_TOKEN),
    baseUrl: WABLAS_BASE_URL,
    sender: process.env.WABLAS_SENDER ?? null,
  });
});

// ────────────────────── Personal sends (v2) ──────────────────────

router.post("/send/text", async (req, res) => {
  const items = ensureItemsArray(req, res);
  if (!items) return;
  const data = items.map((it: any) => ({
    phone: normalizePhone(it.phone),
    message: String(it.message ?? ""),
    isGroup: it.isGroup ? "true" : "false",
    ...(it.ref_id ? { ref_id: it.ref_id } : {}),
    ...(it.priority ? { priority: it.priority } : {}),
    ...(it.retry != null ? { retry: it.retry } : {}),
    ...(it.secret ? { secret: it.secret } : {}),
    ...(it.source ? { source: it.source } : {}),
    ...(it.flag ? { flag: it.flag } : {}),
  }));
  const { status, payload } = await wablas("POST", "/api/v2/send-message", {
    data,
  });
  res.status(status).json(payload);
});

router.post("/send/image", async (req, res) => {
  const items = ensureItemsArray(req, res);
  if (!items) return;
  const data = items.map((it: any) => ({
    phone: normalizePhone(it.phone),
    image: String(it.image ?? ""),
    ...(it.caption ? { caption: String(it.caption) } : {}),
    isGroup: it.isGroup ? "true" : "false",
    ...(it.ref_id ? { ref_id: it.ref_id } : {}),
  }));
  const { status, payload } = await wablas("POST", "/api/v2/send-image", {
    data,
  });
  res.status(status).json(payload);
});

router.post("/send/audio", async (req, res) => {
  const items = ensureItemsArray(req, res);
  if (!items) return;
  const data = items.map((it: any) => ({
    phone: normalizePhone(it.phone),
    audio: String(it.audio ?? ""),
    isGroup: it.isGroup ? "true" : "false",
    ...(it.ref_id ? { ref_id: it.ref_id } : {}),
  }));
  const { status, payload } = await wablas("POST", "/api/v2/send-audio", {
    data,
  });
  res.status(status).json(payload);
});

router.post("/send/video", async (req, res) => {
  const items = ensureItemsArray(req, res);
  if (!items) return;
  const data = items.map((it: any) => ({
    phone: normalizePhone(it.phone),
    video: String(it.video ?? ""),
    caption: String(it.caption ?? ""),
    isGroup: it.isGroup ? "true" : "false",
    ...(it.ref_id ? { ref_id: it.ref_id } : {}),
  }));
  const { status, payload } = await wablas("POST", "/api/v2/send-video", {
    data,
  });
  res.status(status).json(payload);
});

router.post("/send/document", async (req, res) => {
  const items = ensureItemsArray(req, res);
  if (!items) return;
  const data = items.map((it: any) => ({
    phone: normalizePhone(it.phone),
    document: String(it.document ?? ""),
    ...(it.caption ? { caption: String(it.caption) } : {}),
    isGroup: it.isGroup ? "true" : "false",
    ...(it.ref_id ? { ref_id: it.ref_id } : {}),
  }));
  const { status, payload } = await wablas("POST", "/api/v2/send-document", {
    data,
  });
  res.status(status).json(payload);
});

router.post("/send/link", async (req, res) => {
  const items = ensureItemsArray(req, res);
  if (!items) return;
  const data = items.map((it: any) => ({
    phone: normalizePhone(it.phone),
    message: {
      text: String(it.text ?? ""),
      link: String(it.link ?? ""),
    },
    isGroup: it.isGroup ? "true" : "false",
  }));
  const { status, payload } = await wablas("POST", "/api/v2/send-link", {
    data,
  });
  res.status(status).json(payload);
});

router.post("/send/list", async (req, res) => {
  const items = ensureItemsArray(req, res);
  if (!items) return;
  const data = items.map((it: any) => ({
    phone: normalizePhone(it.phone),
    message: {
      title: String(it.title ?? ""),
      description: String(it.description ?? ""),
      buttonText: String(it.buttonText ?? "menu"),
      lists: Array.isArray(it.lists) ? it.lists : [],
      footer: String(it.footer ?? ""),
    },
    isGroup: it.isGroup ? "true" : "false",
  }));
  const { status, payload } = await wablas("POST", "/api/v2/send-list", {
    data,
  });
  res.status(status).json(payload);
});

router.post("/send/location", async (req, res) => {
  const items = ensureItemsArray(req, res);
  if (!items) return;
  const data = items.map((it: any) => ({
    phone: normalizePhone(it.phone),
    message: {
      name: String(it.name ?? ""),
      address: String(it.address ?? ""),
      latitude: Number(it.latitude),
      longitude: Number(it.longitude),
    },
    isGroup: it.isGroup ? "true" : "false",
  }));
  const { status, payload } = await wablas("POST", "/api/v2/send-location", {
    data,
  });
  res.status(status).json(payload);
});

// ────────────────────── Wablas group sends ──────────────────────

router.post("/group/text", async (req, res) => {
  const items = ensureItemsArray(req, res);
  if (!items) return;
  const data = items.map((it: any) => ({
    group_id: String(it.group_id ?? ""),
    message: String(it.message ?? ""),
  }));
  const { status, payload } = await wablas("POST", "/api/v2/group/text", {
    data,
  });
  res.status(status).json(payload);
});

router.post("/group/image", async (req, res) => {
  const items = ensureItemsArray(req, res);
  if (!items) return;
  const data = items.map((it: any) => ({
    group_id: String(it.group_id ?? ""),
    image: String(it.image ?? ""),
    ...(it.caption ? { caption: String(it.caption) } : {}),
  }));
  const { status, payload } = await wablas("POST", "/api/v2/group/image", {
    data,
  });
  res.status(status).json(payload);
});

router.post("/group/video", async (req, res) => {
  const items = ensureItemsArray(req, res);
  if (!items) return;
  const data = items.map((it: any) => ({
    group_id: String(it.group_id ?? ""),
    video: String(it.video ?? ""),
    caption: String(it.caption ?? ""),
  }));
  const { status, payload } = await wablas("POST", "/api/v2/group/video", {
    data,
  });
  res.status(status).json(payload);
});

router.post("/group/audio", async (req, res) => {
  const items = ensureItemsArray(req, res);
  if (!items) return;
  const data = items.map((it: any) => ({
    group_id: String(it.group_id ?? ""),
    audio: String(it.audio ?? ""),
  }));
  const { status, payload } = await wablas("POST", "/api/v2/group/audio", {
    data,
  });
  res.status(status).json(payload);
});

router.post("/group/document", async (req, res) => {
  const items = ensureItemsArray(req, res);
  if (!items) return;
  const data = items.map((it: any) => ({
    group_id: String(it.group_id ?? ""),
    document: String(it.document ?? ""),
    ...(it.caption ? { caption: String(it.caption) } : {}),
  }));
  const { status, payload } = await wablas("POST", "/api/v2/group/document", {
    data,
  });
  res.status(status).json(payload);
});

// ────────────────────── Schedule ──────────────────────

router.post("/schedule", async (req, res) => {
  const items = ensureItemsArray(req, res);
  if (!items) return;
  const { status, payload } = await wablas("POST", "/api/v2/schedule", {
    data: items,
  });
  res.status(status).json(payload);
});

router.put("/schedule/:id", async (req, res) => {
  const items = req.body?.items;
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ status: false, error: "items array is required" });
    return;
  }
  const id = encodeURIComponent(req.params.id);
  const { status, payload } = await wablas(
    "PUT",
    `/api/v2/schedule/${id}`,
    { data: items },
  );
  res.status(status).json(payload);
});

router.delete("/schedule", async (req, res) => {
  const idsParam = req.query.id;
  if (!idsParam) {
    res.status(400).json({
      status: false,
      error: "query parameter 'id' is required (comma-separated)",
    });
    return;
  }
  const ids = encodeURIComponent(String(idsParam));
  const { status, payload } = await wablas(
    "DELETE",
    `/api/v2/delete-schedule?id=${ids}`,
  );
  res.status(status).json(payload);
});

// ────────────────────── Auto Reply ──────────────────────

router.get("/autoreply", async (req, res) => {
  const keyword = req.query.keyword
    ? `?keyword=${encodeURIComponent(String(req.query.keyword))}`
    : "";
  const { status, payload } = await wablas(
    "GET",
    `/api/v2/autoreply/getData${keyword}`,
  );
  res.status(status).json(payload);
});

router.post("/autoreply", async (req, res) => {
  const { keyword, response: reply } = req.body ?? {};
  if (!keyword || !reply) {
    res
      .status(400)
      .json({ status: false, error: "keyword and response are required" });
    return;
  }
  const { status, payload } = await wablas("POST", "/api/v2/autoreply", {
    keyword: String(keyword),
    response: String(reply),
  });
  res.status(status).json(payload);
});

router.put("/autoreply/:id", async (req, res) => {
  const { keyword, response: reply } = req.body ?? {};
  if (!keyword || !reply) {
    res
      .status(400)
      .json({ status: false, error: "keyword and response are required" });
    return;
  }
  const id = encodeURIComponent(req.params.id);
  const { status, payload } = await wablas("PUT", `/api/v2/autoreply/${id}`, {
    keyword: String(keyword),
    response: String(reply),
  });
  res.status(status).json(payload);
});

router.delete("/autoreply/:id", async (req, res) => {
  const id = encodeURIComponent(req.params.id);
  const { status, payload } = await wablas(
    "DELETE",
    `/api/v2/autoreply/${id}`,
  );
  res.status(status).json(payload);
});

// ────────────────────── Contacts ──────────────────────

router.get("/contacts", async (req, res) => {
  const params = new URLSearchParams();
  if (req.query.phone) params.set("phone", String(req.query.phone));
  if (req.query.page) params.set("page", String(req.query.page));
  if (req.query.limit) params.set("limit", String(req.query.limit));
  const qs = params.toString();
  const { status, payload } = await wablas(
    "GET",
    `/api/v2/contact${qs ? `?${qs}` : ""}`,
  );
  res.status(status).json(payload);
});

router.post("/contacts", async (req, res) => {
  const items = ensureItemsArray(req, res, 500);
  if (!items) return;
  const { status, payload } = await wablas("POST", "/api/v2/contact", {
    data: items,
  });
  res.status(status).json(payload);
});

router.put("/contacts", async (req, res) => {
  const items = ensureItemsArray(req, res, 500);
  if (!items) return;
  const { status, payload } = await wablas("POST", "/api/v2/contact/update", {
    data: items,
  });
  res.status(status).json(payload);
});

router.delete("/contacts", async (req, res) => {
  const phone = req.query.phone;
  if (!phone) {
    res.status(400).json({
      status: false,
      error: "query parameter 'phone' is required (comma-separated)",
    });
    return;
  }
  const { status, payload } = await wablas(
    "DELETE",
    `/api/v2/contact?phone=${encodeURIComponent(String(phone))}`,
  );
  res.status(status).json(payload);
});

// ────────────────────── Agents ──────────────────────

router.post("/agents", async (req, res) => {
  const items = ensureItemsArray(req, res, 50);
  if (!items) return;
  const { status, payload } = await wablas("POST", "/api/v2/create-agent", {
    data: items,
  });
  res.status(status).json(payload);
});

// ────────────────────── Media ──────────────────────

router.delete("/media/:id", async (req, res) => {
  const id = encodeURIComponent(req.params.id);
  const { status, payload } = await wablas(
    "DELETE",
    `/api/v2/media/delete/${id}`,
  );
  res.status(status).json(payload);
});

export default router;
