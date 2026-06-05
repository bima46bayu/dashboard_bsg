import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  PROJECT_STORAGE_KEY,
  nextProjectId,
  type MonitoringProject,
} from "@/data/projects";
import { apiFetch, useApi } from "@/lib/api";

type ProjectsContextValue = {
  projects: MonitoringProject[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addProject: (project: Omit<MonitoringProject, "id"> & { id?: string }) => Promise<void>;
  getNextId: () => string;
  fetchNextId: () => Promise<string>;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

function loadProjects(): MonitoringProject[] {
  try {
    const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MonitoringProject[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: MonitoringProject[]) {
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<MonitoringProject[]>(
    useApi ? [] : loadProjects,
  );
  const [loading, setLoading] = useState(useApi);
  const [error, setError] = useState<string | null>(null);
  const [cachedNextId, setCachedNextId] = useState("TPN-0001");

  const refresh = useCallback(async () => {
    if (!useApi) {
      setProjects(loadProjects());
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<MonitoringProject[]>("/api/projects");
      setProjects(data);
      const { id } = await apiFetch<{ id: string }>("/api/projects/next-id");
      setCachedNextId(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const fetchNextId = useCallback(async () => {
    if (!useApi) return nextProjectId(projects);
    const { id } = await apiFetch<{ id: string }>("/api/projects/next-id");
    setCachedNextId(id);
    return id;
  }, [projects]);

  const addProject = useCallback(
    async (project: Omit<MonitoringProject, "id"> & { id?: string }) => {
      if (useApi) {
        const created = await apiFetch<MonitoringProject>("/api/projects", {
          method: "POST",
          body: JSON.stringify(project),
        });
        setProjects((prev) => [created, ...prev]);
        const { id } = await apiFetch<{ id: string }>("/api/projects/next-id");
        setCachedNextId(id);
        return;
      }
      const id = project.id ?? nextProjectId(projects);
      const full = { ...project, id } as MonitoringProject;
      setProjects((prev) => {
        const next = [...prev, full];
        saveProjects(next);
        return next;
      });
    },
    [projects],
  );

  const value = useMemo<ProjectsContextValue>(
    () => ({
      projects,
      loading,
      error,
      refresh,
      addProject,
      getNextId: () => (useApi ? cachedNextId : nextProjectId(projects)),
      fetchNextId,
    }),
    [projects, loading, error, refresh, addProject, cachedNextId, fetchNextId],
  );

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) {
    throw new Error("useProjects must be used within ProjectsProvider");
  }
  return ctx;
}

export type { MonitoringProject };
