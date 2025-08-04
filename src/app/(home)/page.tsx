import { Suspense } from "react";
import { HydrateClient, trpc } from "@/trpc/server";
import PageClient from "./client";
import { ErrorBoundary } from "react-error-boundary";

export default async function Home() {
  void trpc.hello.prefetch({ text: "firasaz" });

  return (
    <HydrateClient>
      <Suspense fallback={<p>Loading ...</p>}>
        <ErrorBoundary fallback={<p>Error ...</p>}>
          <PageClient />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
