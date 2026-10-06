import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

const TOKEN_KEY = "freshbasket_token";
const USER_KEY = "freshbasket_user";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || null
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener("freshbasket:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener(
        "freshbasket:unauthorized",
        handleUnauthorized
      );
  }, [logout]);

  const login = async (credentials) => {
    const response = await authApi.login(credentials);

    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response));

    setToken(response.token);
    setUser(response);

    return response;
  };

  const register = (payload) => authApi.register(payload);

  const refreshProfile = async () => {
    if (!user?.userId) return null;

    const freshUser = await authApi.getProfile(user.userId);
    const merged = { ...user, ...freshUser, token: token || user.token };

    localStorage.setItem(USER_KEY, JSON.stringify(merged));
    setUser(merged);

    return merged;
  };

  const updateStoredUser = (nextUser) => {
    const merged = { ...user, ...nextUser, token: token || user?.token };
    localStorage.setItem(USER_KEY, JSON.stringify(merged));
    setUser(merged);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === "ADMIN",
      isCustomer: user?.role === "CUSTOMER",
      login,
      register,
      logout,
      refreshProfile,
      updateStoredUser,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
