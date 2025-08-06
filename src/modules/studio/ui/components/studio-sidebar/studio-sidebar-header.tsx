import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { UserResource } from "@clerk/types";

interface StudioSidebarHeaderProps {
  className?: string;
}

const SidebarSkeleton = () => {
  return (
    <SidebarHeader className="flex items-center justify-center pb-4">
      <Skeleton className="rounded-full size-[160px]" />
      <div className="flex flex-col gap-y-2 items-center">
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </SidebarHeader>
  );
};
const CollapsedSidebar = ({ user }: { user: UserResource }) => {
  return (
    <SidebarGroup className="bg-background">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip={"Your Profile"} asChild>
            <Link href={"/users/current"}>
              <UserAvatar
                imageUrl={user.imageUrl}
                name={user.fullName ?? "User"}
                size="xs"
              />
              <span className="text-sm">Your profile</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
};

export const StudioSidebarHeader = ({
  className,
}: StudioSidebarHeaderProps) => {
  const { state } = useSidebar();
  const { user } = useUser();

  if (!user) return <SidebarSkeleton />;

  if (state === "collapsed") return <CollapsedSidebar user={user} />;
  return (
    <SidebarHeader
      className={cn(className, "flex items-center justify-center pb-4")}
    >
      <Link href={"/users/current"}>
        <UserAvatar
          imageUrl={user?.imageUrl}
          name={user.fullName ?? "User"}
          size={"xl"}
          className="hover:opacity-80 transition-opacity"
        />
      </Link>
      <div className="flex flex-col gap-y-1 items-center">
        <div className="text-sm font-medium">Your Profile</div>
        <div className="text-xs text-muted-foreground">{user.fullName}</div>
      </div>
    </SidebarHeader>
  );
};
