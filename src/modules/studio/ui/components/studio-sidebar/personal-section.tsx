"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LogOutIcon, VideoIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "Content",
    url: "/studio",
    icon: VideoIcon,
    auth: true,
  },
  {
    title: "Exit Studio",
    url: "/",
    icon: LogOutIcon,
    auth: true,
  },
];

export const PersonalSection = () => {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                isActive={item.title === "Content" && pathname === "/studio"}
                // onClick={(e) => {
                //   if (item.auth && !isSignedIn) {
                //     e.preventDefault();
                //     return clerk.openSignIn();
                //   }
                // }}
              >
                <Link href={item.url}>
                  <item.icon className="size-5" />
                  <span className="text-sm">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
