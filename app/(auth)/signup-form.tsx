"use client";

// Hooks & Next
import { useForm } from "react-hook-form";
import { useSignup, useGoogleAuth, useDropboxAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Validations
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpInput } from "@/schemas/auth";

export default function SignupForm() {
  const signup = useSignup();
  const { initiateGoogleAuth } = useGoogleAuth();
  const { initiateDropboxAuth } = useDropboxAuth();
  const router = useRouter();

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
        className="w-full h-12 rounded-2xl text-base"
        type="submit"
        disabled={signup.isPending}
      >
        {signup.isPending ? "Creating Account..." : "Continue with Email"}
      </Button>
      <div className="flex gap-2 items-center">
        <hr className="w-full h-0.5 bg-border rounded-full" />
        or <hr className="w-full h-0.5 bg-border rounded-full" />
      </div>
      <Button
        variant={"outline"}
        className="w-full h-12 rounded-2xl text-base"
        type="button"
        disabled={signup.isPending}
        onClick={initiateGoogleAuth}
      >
        Continue with Google
      </Button>
      <Button
        variant={"outline"}
        className="w-full h-12 rounded-2xl text-base"
        type="button"
        disabled={signup.isPending}
        onClick={initiateDropboxAuth}
      >
        Continue with Dropbox
      </Button>
      <div className="text-center text-sm pt-4">
        Already have an account?{" "}
        <button
          type="button"
          className="underline hover:no-underline"
          onClick={() => router.push("/login")}
        >
          Log in
        </button>
      </div>
    </form>
  );
}
