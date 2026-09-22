import React, { createContext, useContext, useState } from 'react';
import { getUser, getToken, saveSession, clearSession } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser());

  const login = (token, userData) => {
    saveSession(token, userData);
    setUser(userData);
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const isLoggedIn = !!getToken();

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
