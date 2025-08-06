"use client";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import React from "react";
import { PersonalSection } from "./personal-section";
import { StudioSidebarHeader } from "./studio-sidebar-header";

export const StudioSidebar = () => {
  return (
    <Sidebar className="pt-16 z-40" collapsible="icon">
      <StudioSidebarHeader className="bg-background" />
      <SidebarContent className="bg-background">
        <PersonalSection />
      </SidebarContent>
    </Sidebar>
  );
};
