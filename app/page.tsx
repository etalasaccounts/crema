import React from "react";
import { ChevronRight } from "lucide-react";
import { AuroraText } from "@/components/magicui/aurora-text";
import { cn } from "@/lib/utils";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { RecordButton } from "@/components/record-button";
import { NavbarDemo } from "./navbar";

// Create a reusable recording manager hook
export default function Index() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Recording Setup Dialog */}
      <NavbarDemo />
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-20 text-center space-y-10">
        <div className="space-y-6 max-w-3xl">
          <div className="group relative mx-auto w-fit flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f] ">
            <span
              className={cn(
                "absolute inset-0 block h-full w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]"
              )}
              style={{
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "destination-out",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "subtract",
                WebkitClipPath: "padding-box",
              }}
            />
            ☝🏻 <hr className="mx-2 h-4 w-px shrink-0 bg-neutral-500" />
            <AnimatedGradientText className="text-sm font-medium">
              Vote us in Product Hunt
            </AnimatedGradientText>
            <ChevronRight
              className="ml-1 size-4 stroke-neutral-500 transition-transform
 duration-300 ease-in-out group-hover:translate-x-0.5"
            />
          </div>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tight">
            <AuroraText>Record</AuroraText>, and<br></br>
            Don't Just Tell{" "}
          </h1>
          <p className="text-xl text-subtle-foreground">
            Easily record and share your screen with your teammates, for free.
          </p>

          <RecordButton />
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Crema. All rights reserved.</p>
      </footer>
    </div>
  );
}
