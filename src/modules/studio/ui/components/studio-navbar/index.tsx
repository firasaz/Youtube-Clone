import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "@/modules/auth/ui/components/auth-button";

export const StudioNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white flex items-center pl-2 pr-5 z-50 border-b shadow-md">
      <div className="flex items-center gap-4 w-full justify-between">
        {/* Sidebar and Logo */}
        <div className="flex items-center flex-shrink-0">
          <SidebarTrigger />
          <Link href={"/studio"}>
            <div className="px-4 py-2 flex items-center gap-1">
              <Image src={"/logo.svg"} alt="Logo" width={32} height={32} />
              <div className="text-xl font-semibold tracking-tight">Studio</div>
            </div>
          </Link>
        </div>

        {/* Auth Button */}
        <div className="flex flex-shrink-0 items-center gap-4">
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};
