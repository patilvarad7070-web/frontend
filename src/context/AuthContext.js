import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// ✅ HARD-CODE BACKEND URL (no undefined/api)
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("aura_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    token ? fetchUser() : setLoading(false);
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API}auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API}auth/login`, { email, password });
    localStorage.setItem("aura_token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (email, password, full_name) => {
    const res = await axios.post(`${API}auth/register`, {
      email,
      password,
      full_name,
    });
    localStorage.setItem("aura_token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("aura_token");
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profile) => {
    await axios.put(`${API}auth/profile`, profile, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{ token, user, loading, login, register, logout, updateProfile,fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};   