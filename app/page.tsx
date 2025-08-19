"use client";

import React from "react";

import { AuroraText } from "@/components/magicui/aurora-text";
import { useRouter } from "next/navigation";
import { NavbarDemo } from "./navbar";
import { Button } from "@/components/ui/button";

// Create a reusable recording manager hook
export default function Index() {
  const router = useRouter();

  const handleJoinBeta = () => {
    router.push("/signup");
  };
  return (
    <div className="flex flex-col min-h-screen">
      {/* Recording Setup Dialog */}
      <NavbarDemo />
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-20 text-center space-y-10">
        <div className="space-y-6 max-w-3xl">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tight">
            <AuroraText>Record</AuroraText>, and<br></br>
            Don't Just Tell{" "}
          </h1>
          <p className="text-xl text-subtle-foreground">
            Easily record and share your screen with your teammates, for free.
          </p>

          <Button
            className="text-lg w-40 h-12 rounded-full"
            onClick={handleJoinBeta}
          >
            Join Beta
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Crema. All rights reserved.</p>
      </footer>
    </div>
  );
}
