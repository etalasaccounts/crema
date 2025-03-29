"use client";

// React & Hooks
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

// Components
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Validations
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Supabase
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignupInput = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleSignup = async (input: SignupInput) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            name: input.name,
          },
        },
      });

      if (error) throw error;

      toast.success("Account created successfully!");
      router.push("/d");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Sign up failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4">
      <div className="space-y-1">
        <Input
          {...form.register("name")}
          type="text"
          placeholder="Full Name"
          disabled={loading}
          className="h-12 md:text-base"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
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
        {loading ? "Creating account..." : "Sign up"}
      </Button>
    </form>
  );
}
