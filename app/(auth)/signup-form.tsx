"use client";

// Hooks & Next
import { useForm } from "react-hook-form";
import { useSignup } from "@/hooks/use-auth";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Validations
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpInput } from "@/schemas/auth";

export default function SignupForm() {
  const signup = useSignup();

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleSignup = async (input: SignUpInput) => {
    signup.mutate(input);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4">
      <Button
        variant={"outline"}
        className="w-full h-12 rounded-2xl text-base"
        type="submit"
        disabled={signup.isPending}
        loading={signup.isPending}
      >
        Register with Google
      </Button>
      <div className="flex gap-2 items-center">
        <hr className="w-full h-0.5 bg-gray-300 rounded-full" />
        or <hr className="w-full h-0.5 bg-gray-300 rounded-full" />
      </div>
      <div className="space-y-1">
        <Input
          {...form.register("name")}
          type="text"
          placeholder="Full Name"
          disabled={signup.isPending}
          className="h-12 rounded-2xl md:text-base"
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
          disabled={signup.isPending}
          className="h-12 rounded-2xl md:text-base"
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
          disabled={signup.isPending}
          className="h-12 rounded-2xl md:text-base"
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      <Button
        className="w-full rounded-2xl h-12 text-base"
        type="submit"
        disabled={signup.isPending}
        loading={signup.isPending}
      >
        {signup.isPending ? "Creating account..." : "Join Crema"}
      </Button>
    </form>
  );
}
