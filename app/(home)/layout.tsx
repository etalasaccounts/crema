import { NavbarTop } from "../navbar";
import { Suspense } from "react";

export default function HomeLayout({ children }: any) {
  return (
    <>
      <Suspense fallback={<div className="h-16 bg-muted animate-pulse" />}>
        <NavbarTop />
      </Suspense>
      <div className="container mx-auto py-24">{children}</div>
    </>
  );
}
