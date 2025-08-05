import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { StudioNavbar } from "../components/studio-navbar";
import { StudioSidebar } from "../components/studio-sidebar";

interface LayoutProps {
  children: React.ReactNode;
}
const StudioLayout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="w-full">
        <StudioNavbar />
        <div className="min-h-screen flex pt-[4rem]">
          <StudioSidebar />
          <main className="flex-1 overflow-auto pb-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StudioLayout;
