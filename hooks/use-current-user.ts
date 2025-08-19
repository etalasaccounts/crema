"use client";

import { useQuery } from "@tanstack/react-query";
import { UserContextInterface } from "../interfaces/user";
import { useAuth } from "../providers/auth-provider";
import { useEffect } from "react";

interface CurrentUserResponse {
  user: UserContextInterface;
  isAuthenticated: boolean;
}

const fetchCurrentUser = async (): Promise<CurrentUserResponse> => {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include", // Include HTTP-only cookies
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to fetch user data");
  }

  return response.json();
};

export const useCurrentUser = () => {
  const { login, logout, user: contextUser, isLoading: contextLoading } = useAuth();

  const {
    data,
    isLoading: queryLoading,
    error,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (unauthorized)
      if (error.message === "Unauthorized") {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    enabled: !contextLoading, // Only run query when context is initialized
  });

  // Sync query data with AuthContext
  useEffect(() => {
    if (data?.user && data.isAuthenticated) {
      // Update context with fresh user data
      login(data.user);
    } else if (isError && error?.message === "Unauthorized") {
      // Clear context on unauthorized error
      logout();
    }
  }, [data, isError, error, login, logout]);

  // Determine loading state
  const isLoading = contextLoading || queryLoading;

  // Use context user data if available, otherwise use query data
  const user = contextUser || data?.user || null;
  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    refetch,
    // Expose auth context methods
    login,
    logout,
  };
};

// Export a simpler hook for components that just need user data
export const useUser = () => {
  const { user, isLoading, isAuthenticated } = useCurrentUser();
  return { user, isLoading, isAuthenticated };
};