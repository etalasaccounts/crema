"use client";

// React & Hooks
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

// Components
import { toast } from "sonner";
import { LoginInput, loginSchema } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Validations
import { zodResolver } from "@hookform/resolvers/zod";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = async (input: LoginInput) => {
    setLoading(true);
    try {
      router.push("/d");
    } catch (err: any) {
      toast.error(err.message || "Login failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
      <div className="space-y-1">
        <Input
          {...form.register("email")}
          type="email"
          placeholder="Email"
          disabled={loading}
          className="h-12 md:text-base"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Input
          {...form.register("password")}
          type="password"
          placeholder="Password"
          disabled={loading}
          className="h-12 md:text-base"
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      <Button
        className="w-full h-12 text-base"
        type="submit"
        disabled={loading}
        loading={loading}
      >
        {loading ? "Logging in..." : "Log in"}
      </Button>
    </form>
  );
}
