import StudioLayout from "@/modules/studio/ui/layouts/studio-layout";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <StudioLayout>
      <div>{children}</div>
    </StudioLayout>
  );
};

export default Layout;
