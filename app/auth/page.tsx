import LoginForm from "./components/login-form";

export default async function AuthPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-3xl font-semibold text-center mb-4">Log in</div>
      <LoginForm />
    </div>
  );
}
