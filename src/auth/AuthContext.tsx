import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../api";
import type { AuthUser } from "../types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  loginWithMicrosoft: () => void;
  loginWithTest: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const buildMicrosoftLoginUrl = () => {
  const base = import.meta.env.VITE_API_BASE;
  const redirect = `${window.location.origin}/auth/callback`;
  const scope = "openid profile email offline_access Mail.Send";
  return `${base}/.auth/login/aad?scope=${encodeURIComponent(
    scope
  )}&post_login_redirect_uri=${encodeURIComponent(redirect)}`;
};

const buildMicrosoftLogoutUrl = () => {
  const base = import.meta.env.VITE_API_BASE;
  const redirect = `${window.location.origin}/login`;
  return `${base}/.auth/logout?post_logout_redirect_uri=${encodeURIComponent(
    redirect
  )}`;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loginWithMicrosoft = useCallback(() => {
    window.location.href = buildMicrosoftLoginUrl();
  }, []);

  const loginWithTest = useCallback(
    async (username: string, password: string) => {
      await api.post("/api/auth/test-login", { username, password });
      await refresh();
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // ignore local logout failure
    }

    if (user?.provider === "entra") {
      window.location.href = buildMicrosoftLogoutUrl();
      return;
    }

    setUser(null);
    window.location.href = "/login";
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      refresh,
      loginWithMicrosoft,
      loginWithTest,
      logout,
    }),
    [user, loading, refresh, loginWithMicrosoft, loginWithTest, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
