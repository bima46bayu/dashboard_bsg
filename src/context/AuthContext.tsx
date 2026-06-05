import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, useApi } from "@/lib/api";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_USER_KEY = "atlas-auth-user-v1";

/** Dev-only fallback when VITE_API_URL is not set */
const DEV_CREDENTIALS = {
  email: "admin@atlas.local",
  password: "admin123",
  user: {
    id: "dev-admin",
    email: "admin@atlas.local",
    name: "Admin",
    role: "admin",
  } satisfies AuthUser,
};

function loadStoredUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function saveStoredUser(user: AuthUser | null) {
  if (user) {
    sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(STORAGE_USER_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    const token = getAuthToken();
    const stored = loadStoredUser();

    if (!useApi) {
      if (token && stored) {
        setUser(stored);
      }
      setLoading(false);
      return;
    }

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { user: me } = await apiFetch<{ user: AuthUser }>("/api/auth/me");
      setUser(me);
      saveStoredUser(me);
    } catch {
      clearAuthToken();
      saveStoredUser(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase();

    if (!useApi) {
      if (
        normalized === DEV_CREDENTIALS.email &&
        password === DEV_CREDENTIALS.password
      ) {
        setAuthToken("dev-session");
        saveStoredUser(DEV_CREDENTIALS.user);
        setUser(DEV_CREDENTIALS.user);
        return;
      }
      throw new Error("Invalid email or password");
    }

    const res = await apiFetch<{ token: string; user: AuthUser }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email: normalized, password }),
      },
    );
    setAuthToken(res.token);
    saveStoredUser(res.user);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    saveStoredUser(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, loading, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
