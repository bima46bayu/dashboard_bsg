import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Boxes,
  KanbanSquare,
  PieChart,
  Factory,
  FileText,
  Megaphone,
  BarChart3,
  ChevronDown,
  Activity,
  MessageCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type NavChild = { to: string; label: string; icon: LucideIcon; end?: boolean };

type NavItem =
  | { kind?: "link"; to: string; label: string; icon: LucideIcon; end?: boolean }
  | { kind: "dropdown"; key: string; label: string; icon: LucideIcon; basePath: string; children: NavChild[] };

export const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/sales", label: "Sales", icon: TrendingUp },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  {
    kind: "dropdown",
    key: "project",
    label: "Project",
    icon: KanbanSquare,
    basePath: "/project",
    children: [
      { to: "/project/monitoring", label: "Monitoring Project", icon: Activity },
    ],
  },
  { to: "/profitability", label: "Profitability", icon: PieChart },
  { to: "/asset", label: "Asset", icon: Factory },
  { to: "/document", label: "Document", icon: FileText },
  {
    kind: "dropdown",
    key: "marketing",
    label: "Marketing",
    icon: Megaphone,
    basePath: "/marketing",
    children: [
      { to: "/marketing", label: "Overview", icon: Megaphone, end: true },
      { to: "/marketing/whatsapp", label: "WhatsApp Promo", icon: MessageCircle },
    ],
  },
  { to: "/reporting", label: "Reporting", icon: BarChart3 },
];

export default function TopNav() {
  return (
    <nav className="nav-pill">
      {navItems.map((item) => {
        if ("kind" in item && item.kind === "dropdown") {
          return <NavDropdown key={item.key} item={item} />;
        }
        const link = item as Extract<NavItem, { kind?: "link" }>;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => cn("nav-item", isActive && "active")}
          >
            <link.icon className="h-4 w-4" />
            <span className="inline">{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function NavDropdown({
  item,
}: {
  item: Extract<NavItem, { kind: "dropdown" }>;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const location = useLocation();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive =
    location.pathname === item.basePath ||
    location.pathname.startsWith(item.basePath + "/");

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        (ref.current && ref.current.contains(e.target as Node)) ||
        (dropdownRef.current && dropdownRef.current.contains(e.target as Node))
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onScroll = () => setOpen(false);

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 10,
        left: rect.left + rect.width / 2,
      });
    }
    setOpen((o) => !o);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={handleToggle}
        className={cn("nav-item", isActive && "active")}
      >
        <item.icon className="h-4 w-4" />
        <span className="inline">{item.label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && typeof document !== "undefined" && (
        <div
          ref={dropdownRef}
          role="menu"
          style={{ top: coords.top, left: coords.left }}
          className="fixed z-[100] w-60 -translate-x-1/2 rounded-2xl border border-line bg-bg-surface p-1.5 shadow-card"
        >
          {item.children.map((c) => {
            const active = c.end
              ? location.pathname === c.to
              : location.pathname === c.to ||
                location.pathname.startsWith(c.to + "/");
            return (
              <button
                key={c.to}
                role="menuitem"
                onClick={() => {
                  navigate(c.to);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  active
                    ? "bg-ink text-white"
                    : "text-ink-soft hover:bg-bg-muted hover:text-ink",
                )}
              >
                <c.icon className="h-4 w-4" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
