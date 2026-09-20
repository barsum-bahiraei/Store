import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "~/features/auth/api/auth-api";
import type { AccountUser, UserProfileUpdateInput } from "~/features/auth/models/account";
import { AUTH_TOKEN_KEY } from "~/shared/http/http-client";

interface AuthContextValue {
  isAuthenticated: boolean;
  isReady: boolean;
  currentUser: AccountUser | null;
  sendOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (phoneNumber: string, code: string) => Promise<AccountUser>;
  updateProfile: (input: UserProfileUpdateInput) => Promise<void>;
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

  const sendOtp = async (phoneNumber: string) => {
    await authApi.sendOtp({ phoneNumber });
  };

  const verifyOtp = async (phoneNumber: string, code: string) => {
    const { token } = await authApi.verifyOtp({ phoneNumber, code });
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    setHasToken(true);
    try {
      const user = await authApi.profile();
      setCurrentUser(user);
      return user;
    } catch (error) {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      setHasToken(false);
      setCurrentUser(null);
      throw error;
    }
  };

  const logout = () => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    setCurrentUser(null);
    setHasToken(false);
  };

  const updateProfile = async (input: UserProfileUpdateInput) => {
    const updated = await authApi.updateProfile(input);
    setCurrentUser((current) =>
      current ? { ...current, ...updated } : current
    );
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: hasToken, isReady, currentUser, sendOtp, verifyOtp, updateProfile, logout }}
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
