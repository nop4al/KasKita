import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar-nav";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardLoadingScreen } from "@/components/dashboard/loading-screen";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <DashboardLoadingScreen minDuration={700} />
      <DashboardSidebar />
      <SidebarInset className="bg-slate-50 dark:bg-zinc-950 min-h-screen flex flex-col transition-colors">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
