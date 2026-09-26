import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "~/features/auth/api/auth-api";
import type { AccountUser, UserProfileUpdateInput } from "~/features/auth/models/account";
import {
  clearAuthToken,
  getAuthToken,
  onAuthTokenCleared,
  setAuthToken,
} from "~/shared/http/auth-token";

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
  const [isReady, setIsReady] = useState(false);

  useEffect(
    () =>
      onAuthTokenCleared(() => {
        setCurrentUser(null);
        setIsReady(true);
      }),
    [],
  );

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setIsReady(true);
      return;
    }

    void authApi.profile()
      .then(setCurrentUser)
      .catch(() => {
        clearAuthToken();
        setCurrentUser(null);
      })
      .finally(() => {
        setIsReady(true);
      });
  }, []);

  const sendOtp = async (phoneNumber: string) => {
    await authApi.sendOtp({ phoneNumber });
  };

  const verifyOtp = async (phoneNumber: string, code: string) => {
    const { token } = await authApi.verifyOtp({ phoneNumber, code });
    setAuthToken(token);
    try {
      const user = await authApi.profile();
      setCurrentUser(user);
      return user;
    } catch (error) {
      clearAuthToken();
      setCurrentUser(null);
      throw error;
    }
  };

  const logout = () => {
    clearAuthToken();
    setCurrentUser(null);
  };

  const updateProfile = async (input: UserProfileUpdateInput) => {
    const updated = await authApi.updateProfile(input);
    setCurrentUser((current) =>
      current ? { ...current, ...updated } : current
    );
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: currentUser !== null, isReady, currentUser, sendOtp, verifyOtp, updateProfile, logout }}
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
