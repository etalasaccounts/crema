"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  HoveredLink,
  Menu,
  MenuItem,
  ProductItem,
} from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";

export function NavbarDemo() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Navbar className="top-4 " />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-lg mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        {/* <MenuItem setActive={setActive} active={active} item="Services">
          <div className="flex flex-col space-y-4 text-sm ">
            <HoveredLink href="/web-dev">Web Development</HoveredLink>
            <HoveredLink href="/interface-design">Interface Design</HoveredLink>
            <HoveredLink href="/seo">Search Engine Optimization</HoveredLink>
            <HoveredLink href="/branding">Branding</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Products">
          <div className="  text-sm grid grid-cols-2 gap-10 p-4 ">
            <ProductItem
              title="Algochurn"
              href="https://algochurn.com"
              src="https://assets.aceternity.com/demos/algochurn.webp"
              description="Prepare for tech interviews like never before."
            />
            <ProductItem
              title="Tailwind Master Kit"
              href="https://tailwindmasterkit.com"
              src="https://assets.aceternity.com/demos/tailwindmasterkit.webp"
              description="Production ready Tailwind css components for your next project"
            />
            <ProductItem
              title="Moonbeam"
              href="https://gomoonbeam.com"
              src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.51.31%E2%80%AFPM.png"
              description="Never write from scratch again. Go from idea to blog in minutes."
            />
            <ProductItem
              title="Rogue"
              href="https://userogue.com"
              src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.47.07%E2%80%AFPM.png"
              description="Respond to government RFPs, RFIs and RFQs 10x faster using AI"
            />
          </div>
        </MenuItem>
        // <MenuItem setActive={setActive} active={active} item="Pricing">
        //   <div className="flex flex-col space-y-4 text-sm">
        //     <HoveredLink href="/hobby">Hobby</HoveredLink>
        //     <HoveredLink href="/individual">Individual</HoveredLink>
        //     <HoveredLink href="/team">Team</HoveredLink>
        //     <HoveredLink href="/enterprise">Enterprise</HoveredLink>
        //   </div>
        // </MenuItem> */}
        <div className="flex gap-2 w-fit items-center">
          {" "}
          <Image
            src={"/assets/crema-logo.svg"}
            alt="logo"
            width={28}
            height={28}
          />{" "}
          <p className="text-xl font-medium text-white">Crema</p>
        </div>

        <div className="flex gap-2 w-full justify-end">
          {" "}
          <Button
            variant="secondary"
            size="lg"
            className="text-base bg-white/20 hover:bg-white/30 text-white hover:text-white px-4 py-5"
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            Login
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="rounded-full text-base bg-primary hover:bg-primary/90 text-white hover:text-white px-4 py-5"
            onClick={() => {
              window.location.href = "/signup";
            }}
          >
            <p>Sign up free</p>
          </Button>
        </div>
      </Menu>
    </div>
  );
}
