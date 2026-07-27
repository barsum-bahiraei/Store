import { createContext, useContext, useState, type ReactNode } from "react";

interface User {
  username: string;
  password: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  currentUser: string | null;
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MOCK_USERS: User[] = [{ username: "admin", password: "admin" }];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const login = (username: string, password: string) => {
    const user = users.find((u) => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user.username);
      return true;
    }
    return false;
  };

  const register = (username: string, password: string) => {
    const exists = users.some((u) => u.username === username);
    if (exists) return false;

    setUsers((prev) => [...prev, { username, password }]);
    setCurrentUser(username);
    return true;
  };

  const logout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: currentUser !== null, currentUser, login, register, logout }}
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
