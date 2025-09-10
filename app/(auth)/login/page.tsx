import LoginForm from "@/app/(auth)/login-form";
import { Suspense } from "react";

export default async function AuthPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-4xl font-semibold text-center tracking-tighter mb-10">
        Log in to Screenbolt
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
