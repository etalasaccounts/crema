"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserContextInterface } from "@/interfaces/user";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: UserContextInterface | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: UserContextInterface) => void;
  logout: (shouldRedirect?: boolean) => void;
  updateUser: (userData: Partial<UserContextInterface>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserContextInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear corrupted data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: UserContextInterface) => {
    setUser(userData);
    setIsLoading(false);
  };

  const logout = async (shouldRedirect: boolean = true) => {
    try {
      // Call logout API to clear HTTP-only cookie
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear local state regardless of API success
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      if (shouldRedirect) {
        router.push("/login");
      }
    }
  };

  const updateUser = (userData: Partial<UserContextInterface>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthContext };
