import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  MessageSquareText,
  Send,
  Settings as SettingsIcon,
  Users,
  Users2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageShell";
import { cn } from "@/lib/cn";
import { useApi } from "@/lib/api";
import { getWhatsAppStatus, type WhatsAppStatus } from "@/lib/whatsapp";
import { StatusBanner } from "@/components/whatsapp/common";
import SendTab from "@/components/whatsapp/SendTab";
import GroupsTab from "@/components/whatsapp/GroupsTab";
import ScheduleTab from "@/components/whatsapp/ScheduleTab";
import AutoReplyTab from "@/components/whatsapp/AutoReplyTab";
import ContactsTab from "@/components/whatsapp/ContactsTab";
import SettingsTab from "@/components/whatsapp/SettingsTab";

type TabKey = "send" | "groups" | "schedule" | "autoreply" | "contacts" | "settings";

const TABS: { key: TabKey; label: string; icon: LucideIcon; desc: string }[] = [
  { key: "send", label: "Send", icon: Send, desc: "Personal messages (8 types)" },
  { key: "groups", label: "Groups", icon: Users2, desc: "Wablas group broadcasts" },
  { key: "schedule", label: "Schedule", icon: CalendarClock, desc: "Scheduled messages" },
  { key: "autoreply", label: "Auto Reply", icon: MessageSquareText, desc: "Keyword auto-responses" },
  { key: "contacts", label: "Contacts", icon: Users, desc: "Wablas contact book" },
  { key: "settings", label: "Settings", icon: SettingsIcon, desc: "Agents & media" },
];

export default function WhatsAppPromoPage() {
  const [tab, setTab] = useState<TabKey>("send");
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getWhatsAppStatus()
      .then((s) => mounted && setStatus(s))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const canCall = useApi && status?.configured === true;

  return (
    <>
      <PageHeader
        title="WhatsApp Promo"
        subtitle="Full Wablas v2 API console"
        actions={
          <Link
            to="/marketing"
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-bg-surface px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Marketing
          </Link>
        }
      />

      <StatusBanner status={status} loading={loading} />

      <div className="mt-4 flex gap-1 overflow-x-auto rounded-2xl border border-line bg-bg-surface p-1">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "group inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-ink text-white shadow-sm"
                  : "text-ink-soft hover:bg-bg-muted",
              )}
              title={t.desc}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {tab === "send" && <SendTab canCall={canCall} />}
        {tab === "groups" && <GroupsTab canCall={canCall} />}
        {tab === "schedule" && <ScheduleTab canCall={canCall} />}
        {tab === "autoreply" && <AutoReplyTab canCall={canCall} />}
        {tab === "contacts" && <ContactsTab canCall={canCall} />}
        {tab === "settings" && (
          <SettingsTab status={status} canCall={canCall} />
        )}
      </div>
    </>
  );
}
