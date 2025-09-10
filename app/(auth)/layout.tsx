"use client";

import AuthFooter from "@/app/(auth)/auth-footer";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function AuthLayout({ children }: any) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which logo to use
  const logoSrc =
    mounted && (resolvedTheme === "dark" || theme === "dark")
      ? "/assets/logo-white.png"
      : "/assets/logo-black.png";

  return (
    <>
      <div className="flex flex-col w-full h-screen">
        <div className="flex flex-col w-full h-full px-4 md:px-6 items-center justify-center">
          <Image
            src={logoSrc}
            alt="logo"
            width={160}
            height={56}
            className="mb-10"
          />

          {children}
        </div>
        <AuthFooter />
      </div>
    </>
  );
}
