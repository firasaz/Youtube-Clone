import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <div>layout</div>
      <div>{children}</div>
    </div>
  );
};

export default Layout;
