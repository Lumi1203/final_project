import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function fetchMe() {
    try {
      const res = await api.get("/auth/me/");
      setUser(res.data);
    } catch {
      setUser(null);
    }
  }

  async function login(username, password) {
    const res = await api.post("/auth/token/", { username, password });
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    await fetchMe();
  }

  async function register(payload) {
    await api.post("/auth/register/", payload);
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  }

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
