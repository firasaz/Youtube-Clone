"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ClapperboardIcon, UserCircleIcon } from "lucide-react";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";

const UserButtonSkeleton = () => {
  return <Skeleton className="rounded-full size-8"></Skeleton>;
};

export const AuthButton = () => {
  return (
    <>
      {/* Show skeleton while Clerk is loading */}
      <ClerkLoading>
        <UserButtonSkeleton />
      </ClerkLoading>

      {/* Only render when Clerk is fully loaded and user is signed in */}
      <ClerkLoaded>
        <SignedIn>
          {/* <UserButtonSkeleton /> */}
          <UserButton fallback={<UserButtonSkeleton />}>
            <UserButton.MenuItems>
              <UserButton.Link
                label="Studio"
                href="/studio"
                labelIcon={<ClapperboardIcon className="size-4" />}
              />
            </UserButton.MenuItems>
          </UserButton>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button
              variant={"outline"}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 focus-visible:ring-0 focus-visible:border-blue-800 border-blue-500/20 rounded-full shadow-none"
            >
              <UserCircleIcon />
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>
      </ClerkLoaded>
    </>
  );
};
