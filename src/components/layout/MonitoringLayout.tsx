import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronDown,
  ChevronUp,
  FolderKanban,
  PlusCircle,
  Database,
  Users,
  Package,
  Receipt,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Leaf = { to: string; label: string; icon: LucideIcon; end?: boolean };
type Group = { key: string; label: string; icon: LucideIcon; children: Leaf[] };
type Item = Leaf | Group;

const items: Item[] = [
  { to: "/project/monitoring", label: "Projects", icon: FolderKanban },
  { to: "/project/monitoring/new", label: "New Project", icon: PlusCircle },
  {
    key: "master",
    label: "Master Data",
    icon: Database,
    children: [
      {
        to: "/project/monitoring/master",
        label: "People & Partners",
        icon: Users,
        end: true,
      },
      { to: "/project/monitoring/master/items", label: "Master Item", icon: Package },
      { to: "/project/monitoring/master/indirect-cost", label: "Master Indirect Cost", icon: Receipt },
    ],
  },
];

export default function MonitoringLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();
  const [masterOpen, setMasterOpen] = useState(
    location.pathname.startsWith("/project/monitoring/master"),
  );

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-ink">
      <aside className="flex w-64 flex-col border-r border-line bg-white">
        <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-left"
            aria-label="Back to Atlas"
          >
            <ArrowLeft className="h-4 w-4 text-ink-muted" />
            <span className="text-sm font-semibold tracking-tight text-blue-700">
              Project Monitoring
            </span>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 text-sm">
          {items.map((item) => {
            if ("children" in item) {
              const anyActive = item.children.some(
                (c) => location.pathname === c.to,
              );
              return (
                <div key={item.key}>
                  <button
                    onClick={() => setMasterOpen((o) => !o)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 font-medium transition-colors",
                      anyActive
                        ? "text-blue-700"
                        : "text-ink-soft hover:bg-bg-muted",
                    )}
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    {masterOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {masterOpen && (
                    <div className="mt-1 space-y-0.5 pl-3">
                      {item.children.map((c) => (
                        <SideLink key={c.to} item={c} end={c.end} />
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return <SideLink key={item.to} item={item} end={item.to.endsWith("monitoring")} />;
          })}
        </nav>

        <div className="border-t border-line px-3 py-4">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-bg-muted"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <div className="mt-2 px-3 text-[11px] text-ink-faint">
            Project Monitoring v1.0
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function SideLink({ item, end }: { item: Leaf; end?: boolean }) {
  return (
    <NavLink
      to={item.to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium transition-colors",
          isActive
            ? "bg-blue-50 text-blue-700"
            : "text-ink-soft hover:bg-bg-muted",
        )
      }
    >
      <item.icon className="h-4 w-4" />
      <span>{item.label}</span>
    </NavLink>
  );
}
