import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "~/features/auth/api/auth-api";
import type { AccountUser, LoginInput, RegisterInput } from "~/features/auth/models/account";
import { AUTH_TOKEN_KEY } from "~/shared/http/http-client";

interface AuthContextValue {
  isAuthenticated: boolean;
  isReady: boolean;
  currentUser: AccountUser | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AccountUser | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setIsReady(true);
      return;
    }

    setHasToken(true);
    void authApi.profile()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null))
      .finally(() => {
        setHasToken(Boolean(window.localStorage.getItem(AUTH_TOKEN_KEY)));
        setIsReady(true);
      });
  }, []);

  const login = async (input: LoginInput) => {
    const { token, ...user } = await authApi.login(input);
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    setCurrentUser(user);
    setHasToken(true);
  };

  const register = async (input: RegisterInput) => {
    const { token, ...user } = await authApi.register(input);
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    setCurrentUser(user);
    setHasToken(true);
  };

  const logout = () => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    setCurrentUser(null);
    setHasToken(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: hasToken, isReady, currentUser, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
