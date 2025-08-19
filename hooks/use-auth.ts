import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { SignUpInput, LoginInput } from "@/schemas/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

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