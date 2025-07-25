import HomeLayout from "@/modules/home/ui/layouts/home-layout";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <HomeLayout>
      <div>{children}</div>
    </HomeLayout>
  );
};

export default Layout;
