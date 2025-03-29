import SignupForm from "../components/signup-form";

export default async function SignupPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-3xl font-semibold text-center mb-4">Sign up</div>
      <SignupForm />
    </div>
  );
}
