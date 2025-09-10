"use client";
import React, { useState } from "react";
import { RecordButton } from "@/components/record-button";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";
import { getUserInitials } from "@/lib/user-utils";
import { useCurrentUser } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export function NavbarTop() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Navbar className="top-4 " />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const { user, isLoading, logout } = useCurrentUser();

  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleLogoClick = () => {
    if (user) {
      router.push("/home");
    } else {
      router.push("/");
    }
  };

  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        <div className="flex gap-2 w-fit items-center">
          {" "}
          <Image
            src={"/assets/logo-white.png"}
            alt="logo"
            width={160}
            height={80}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          />{" "}
        </div>
        <div className="flex gap-3 w-full justify-end">
          {isLoading ? (
            <div className="flex gap-2 items-center">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          ) : user ? (
            <div className="flex gap-1 w-fit justify-end">
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex gap-2 items-center w-fit">
                    <p className="text-white">{user.name}</p>
                    <Avatar className="cursor-pointer hover:opacity-80">
                      {user.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                      ) : (
                        <AvatarFallback className="bg-white/20">
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-40 p-2 bg-background rounded-2xl"
                >
                  <div className="space-y-2 text-white">
                    <div className="p-2 space-y-2">
                      <h4 className="font-medium text-sm leading-none">
                        {user.name}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-2 hover:bg-white/10 hover:text-neutral-100"
                        onClick={() => router.push("/account")}
                      >
                        Account
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-2 hover:bg-white/10 hover:text-neutral-100"
                        onClick={() => router.push("/billing")}
                      >
                        Billing
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-2 hover:bg-white/10 hover:text-neutral-100"
                        onClick={handleLogout}
                      >
                        Log out
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <RecordButton />
            </div>
          ) : (
            <Button
              variant="secondary"
              className="bg-neutral-600 text-white text-lg"
              onClick={handleLogin}
            >
              Login
            </Button>
          )}
        </div>{" "}
      </Menu>
    </div>
  );
}
