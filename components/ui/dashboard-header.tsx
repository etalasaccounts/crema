"use client";

import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  href?: string;
  label: string;
  isCurrentPage?: boolean;
}

interface DashboardHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  actions?: ReactNode;
  children?: ReactNode;
}

export function DashboardHeader({
  breadcrumbs,
  actions,
  children,
}: DashboardHeaderProps) {
  return (
    <header className="flex px-4 w-full h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border">
      <div className="flex items-center gap-2 flex-1">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList className="hidden sm:visible">
            {breadcrumbs.map((item, index) => (
              <BreadcrumbItem key={index}>
                {item.isCurrentPage ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                )}
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {actions && <div className="pr-4">{actions}</div>}
      {children}
    </header>
  );
}
