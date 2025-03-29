"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function AuthFooter() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/auth";

  return (
    <>
      <footer className="flex h-28 w-full px-4 md:px-6 border-t border-border items-center justify-center gap-1">
        <p className="text-muted-foreground">
          {isLoginPage ? "Don't have an account?" : "Already have an account?"}
        </p>
        <Link
          href={isLoginPage ? "/auth/signup" : "/auth"}
          className="text-primary underline-offset-4 hover:underline"
        >
          {isLoginPage ? "Register" : "Log in"}
        </Link>
      </footer>
    </>
  );
}
