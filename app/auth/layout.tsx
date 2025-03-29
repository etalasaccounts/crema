import AuthFooter from "./components/auth-footer";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: any) {
  return (
    <>
      <div className="flex flex-col w-full h-screen ">
        <header className="flex w-full h-16 px-4 md:px-6 items-center justify-between">
          <p>Logo</p>
          <ThemeToggle />
        </header>
        <div className="flex flex-col w-full h-full px-4 md:px-6 items-center justify-center">
          {children}
        </div>
        <AuthFooter />
      </div>
    </>
  );
}
