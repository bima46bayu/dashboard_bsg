import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, MessageSquare, Search, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import TopNav from "./TopNav";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between gap-4 pt-2">
      <div className="flex-1 hidden lg:block" />
      <div className="shrink min-w-0 max-w-full pb-1">
        <TopNav />
      </div>
      <div className="flex flex-1 items-center justify-end gap-2">
        {user?.role === "admin" && (
          <button
            onClick={() => navigate("/users")}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-full text-sm font-semibold transition mr-2"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Users</span>
          </button>
        )}
        <UserMenu
          name={user?.name ?? "User"}
          email={user?.email}
          onLogout={() => {
            logout();
            navigate("/login");
          }}
        />
      </div>
    </header>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
}

function UserMenu({
  name,
  email,
  onLogout,
}: {
  name: string;
  email?: string;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
        className="h-10 w-10 overflow-hidden rounded-full bg-accent-peach ring-1 ring-line transition-shadow hover:ring-ink/20"
      >
        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-accent-peach to-accent-rose text-sm font-medium text-ink">
          {initials(name)}
        </div>
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-line bg-bg-surface py-2 shadow-card">
            <div className="border-b border-line px-4 py-3">
              <div className="text-sm font-semibold text-ink">{name}</div>
              {email ? (
                <div className="mt-0.5 truncate text-xs text-ink-muted">
                  {email}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-ink-soft transition-colors hover:bg-bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
