import SignupForm from "@/app/(auth)/signup-form";
import { Suspense } from "react";

export default async function SignupPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-4xl font-semibold text-center tracking-tighter mb-10">
        Record & share, create your free account.
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
