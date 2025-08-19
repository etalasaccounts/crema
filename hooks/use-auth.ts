import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { SignUpInput, LoginInput } from "@/schemas/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useEffect } from "react";

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

// Authentication hooks
export const useSignup = () => {
  const router = useRouter();
  const { login } = useAuth();
  
  return useMutation({
    mutationFn: signupUser,
    onSuccess: (data) => {
      toast.success("Account created successfully!");
      // Store user data in localStorage and context
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      login(data.user);
      router.push("/home");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Signup failed");
    },
  });
};

export const useLogin = () => {
  const router = useRouter();
  const { login } = useAuth();
  
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      toast.success("Login successful!");
      // Store user data in localStorage and context
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      login(data.user);
      router.push("/home");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login failed");
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const { logout } = useAuth();
  
  return useMutation({
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
};

// Hook for handling OAuth authentication results
export const useOAuthHandler = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const authStatus = searchParams.get('auth');
    const error = searchParams.get('error');

    if (authStatus === 'success') {
      // Fetch user data from the me endpoint
      fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      })
        .then(response => response.json())
        .then(data => {
          if (data.user) {
            // Set user data in auth context
            login(data.user);
            toast.success('Successfully logged in with Google!');
          } else {
            toast.error('Failed to fetch user data');
          }
        })
        .catch(() => {
          toast.error('Failed to fetch user data');
        })
        .finally(() => {
          // Clear the URL parameters
          router.replace('/home');
        });
    } else if (error) {
      // Handle different OAuth error types
      const errorMessages: Record<string, string> = {
        oauth_error: 'OAuth authentication failed',
        missing_code: 'Authentication code missing',
        invalid_state: 'Invalid authentication state',
        oauth_config: 'OAuth configuration error',
        token_exchange: 'Failed to exchange authorization code',
        user_info: 'Failed to retrieve user information',
        unverified_email: 'Email address is not verified with Google',
        email_exists: 'An account with this email already exists',
        oauth_callback: 'OAuth callback error'
      };

      const errorMessage = errorMessages[error] || 'Authentication failed';
      toast.error(errorMessage);
      
      // Clear the error from URL
      router.replace('/login');
    }
  }, [searchParams, router, login]);
};

// Hook for initiating Google OAuth
export const useGoogleAuth = () => {
  const initiateGoogleAuth = () => {
    window.location.href = '/api/auth/google';
  };

  return { initiateGoogleAuth };
};