"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SignUpInput, LoginInput } from "@/schemas/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useEffect } from "react";
import { UserContextInterface } from "@/interfaces/user";

// API functions
const signupUser = async (data: SignUpInput) => {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Signup failed");
  }

  return response.json();
};

const loginUser = async (data: LoginInput) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  return response.json();
};

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

// Internal hook that provides shared authentication functionality
const useAuthInternal = () => {
  const {
    login,
    logout,
    user: contextUser,
    isLoading: contextLoading,
  } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Current user query - verifies authentication status with server
  const {
    data: currentUserData,
    isLoading: queryLoading,
    error: queryError,
    refetch: refetchCurrentUser,
    isError,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
    if (isError && queryError?.message === "Unauthorized") {
      // Clear user state but only redirect if not on a public page
      logout(false);
    }
  }, [isError, queryError, logout]);

  // Determine loading state
  const isLoading = contextLoading || queryLoading;

  // Use context user data if available, otherwise use query data
  const user = contextUser || currentUserData?.user || null;
  const isAuthenticated = !!user;

  // OAuth handler effect
  useEffect(() => {
    const authStatus = searchParams.get("auth");
    const error = searchParams.get("error");
    const details = searchParams.get("details");

    if (authStatus === "success") {
      // Fetch user data from the me endpoint
      fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.user) {
            // Set user data in auth context
            login(data.user);
            // Toast will be shown by the regular login flow
          } else {
            toast.error("Failed to fetch user data");
          }
        })
        .catch(() => {
          toast.error("Failed to fetch user data");
        })
        .finally(() => {
          // Clear the URL parameters
          router.replace("/home");
        });
    } else if (error) {
      // Handle different OAuth error types
      const errorMessages: Record<string, string> = {
        oauth_error: "OAuth authentication failed",
        missing_code: "Authentication code missing",
        invalid_state: "Invalid authentication state",
        oauth_config: "OAuth configuration error",
        token_exchange: "Failed to exchange authorization code",
        token_error: "Failed to obtain access token",
        user_info: "Failed to retrieve user information",
        unverified_email: "Email address is not verified",
        email_exists: "An account with this email already exists",
        oauth_callback: "Authentication failed",
      };

      const errorMessage = errorMessages[error] || "Authentication failed";
      const fullMessage = details
        ? `${errorMessage}: ${details}`
        : errorMessage;
      toast.error(fullMessage);

      // Clear the error from URL
      router.replace("/login");
    }
  }, [searchParams, router, login]);

  // OAuth initiators
  const initiateGoogleAuth = () => {
    window.location.href = "/api/auth/google";
  };

  const initiateDropboxAuth = () => {
    window.location.href = "/api/auth/dropbox";
  };

  return {
    // User state
    user,
    isLoading,
    isAuthenticated,
    error: queryError,
    refetchCurrentUser,

    // Auth context methods
    login,
    logout,

    // OAuth
    initiateGoogleAuth,
    initiateDropboxAuth,
  };
};

// Export individual hooks for specific functionality
export const useUser = () => {
  const { user, isLoading, isAuthenticated } = useAuthInternal();
  return { user, isLoading, isAuthenticated };
};

export const useSignup = () => {
  const { login } = useAuthInternal();
  const router = useRouter();
  const queryClient = useQueryClient();

  const signupMutation = useMutation({
    mutationFn: signupUser,
    onSuccess: async (data) => {
      toast.success("Account created successfully!");
      // Store user data in localStorage and context
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      login(data.user);

      // Invalidate the currentUser query to refetch with new cookie
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      // Small delay to ensure cookie is processed
      setTimeout(() => {
        router.push("/home");
      }, 100);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Signup failed");
    },
  });

  return {
    mutate: signupMutation.mutate,
    mutateAsync: signupMutation.mutateAsync,
    isPending: signupMutation.isPending,
  };
};

export const useLogin = () => {
  const { login } = useAuthInternal();
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      toast.success("Login successful!", {
        id: "login-success",
      });
      // Store user data in localStorage and context
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      login(data.user);

      // Invalidate the currentUser query to refetch with new cookie
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      // Small delay to ensure cookie is processed
      setTimeout(() => {
        router.push("/home");
      }, 100);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login failed");
    },
  });

  return {
    mutate: loginMutation.mutate,
    mutateAsync: loginMutation.mutateAsync,
    isPending: loginMutation.isPending,
  };
};

export const useLogout = () => {
  const { logout } = useAuthInternal();
  const router = useRouter();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Use the logout method from AuthContext which handles everything
      await logout();
    },
    onSuccess: () => {
      toast.success("Logged out successfully!");
      // AuthContext logout already handles redirect, but we can ensure it
      router.push("/login");
    },
    onError: (error: Error) => {
      toast.error("Logout failed");
      // Fallback: still try to clear local state
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/login");
    },
  });

  return {
    mutate: logoutMutation.mutate,
    mutateAsync: logoutMutation.mutateAsync,
    isPending: logoutMutation.isPending,
  };
};

export const useCurrentUser = () => {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    refetchCurrentUser,
    login,
    logout,
  } = useAuthInternal();
  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    refetch: refetchCurrentUser,
    login,
    logout,
  };
};

// Hook for initiating Google OAuth
export const useGoogleAuth = () => {
  const { initiateGoogleAuth } = useAuthInternal();
  return { initiateGoogleAuth };
};

// Hook for initiating Dropbox OAuth
export const useDropboxAuth = () => {
  const { initiateDropboxAuth } = useAuthInternal();
  return { initiateDropboxAuth };
};

// Hook for handling OAuth authentication results
// This is now handled internally, so we just return an empty function for compatibility
export const useOAuthHandler = () => {
  return () => {};
};
