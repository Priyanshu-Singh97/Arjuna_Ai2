// AuthProvider.js
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [user, setUser] = useState(null);

  // ✅ Define logOut with useCallback so it’s stable across renders
  const logOut = useCallback(() => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
    navigate("/login");
  }, [navigate]);

  const logIn = useCallback(
    (newToken) => {
      localStorage.setItem("access_token", newToken);
      setToken(newToken);
      navigate("/welcome");
    },
    [navigate]
  );

  // ✅ Now useEffect can safely depend on token & logOut
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logOut();
        } else {
          setUser(decoded);
        }
      } catch {
        logOut();
      }
    }
  }, [token, logOut]);

  return (
    <AuthContext.Provider value={{ token, user, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
