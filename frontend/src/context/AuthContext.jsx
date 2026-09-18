import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthApi } from "../api/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("educrm_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("educrm_token");
    if (!token) { setReady(true); return; }
    AuthApi.me()
      .then(({ user }) => { setUser(user); localStorage.setItem("educrm_user", JSON.stringify(user)); })
      .catch(() => { localStorage.removeItem("educrm_token"); localStorage.removeItem("educrm_user"); setUser(null); })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (login, password) => {
    const { token, user } = await AuthApi.login(login, password);
    localStorage.setItem("educrm_token", token);
    localStorage.setItem("educrm_user", JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("educrm_token");
    localStorage.removeItem("educrm_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
