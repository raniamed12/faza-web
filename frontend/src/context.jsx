import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api, getToken, setToken } from "./api.js";

// ───── Authentification : l’utilisateur courant est disponible partout via useAuth() ─────
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!getToken());
  useEffect(() => {
    if (!getToken()) return;
    api.get("/auth/me").then((r) => setUser(r.user)).catch(() => setToken(null)).finally(() => setReady(true));
  }, []);
  const login = useCallback(async (email, password) => {
    const r = await api.post("/auth/login", { email, password });
    setToken(r.token); setUser(r.user); return r.user;
  }, []);
  const register = useCallback(async (name, email, password) => {
    const r = await api.post("/auth/register", { name, email, password });
    setToken(r.token); setUser(r.user); return r.user;
  }, []);
  const logout = useCallback(() => { setToken(null); setUser(null); }, []);
  return <AuthCtx.Provider value={{ user, ready, login, register, logout }}>{children}</AuthCtx.Provider>;
}

// ───── Petits messages de confirmation / d’erreur ─────
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const n = useRef(0);
  const push = useCallback((text, opts = {}) => {
    const id = ++n.current;
    setItems((l) => [...l, { id, text, ...opts }]);
    setTimeout(() => setItems((l) => l.filter((x) => x.id !== id)), opts.ms || 4200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => <div key={t.id} className={`toast ${t.error ? "toast--err" : ""}`}>{t.text}{t.action}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}

// ───── Chargement de données avec états « chargement / erreur » ─────
export function useFetch(path, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  useEffect(() => {
    let alive = true;
    if (path == null) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    api.get(path).then((data) => alive && setState({ data, error: null, loading: false })).catch((error) => alive && setState({ data: null, error, loading: false }));
    return () => { alive = false; };
  }, [path, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
  return state;
}
