import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { HomeNavbar } from "../components/home-navbar";
import { HomeSidebar } from "../components/home-sidebar";

interface LayoutProps {
  children: React.ReactNode;
}
const HomeLayout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="w-full">
        <HomeNavbar />
        <div className="min-h-screen flex pt-[4rem]">
          <HomeSidebar />
          <main className="flex-1 overflow-auto pb-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default HomeLayout;
