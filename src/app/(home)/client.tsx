"use client";

import { trpc } from "@/trpc/client";

const PageClient = () => {
  const [data] = trpc.hello.useSuspenseQuery({
    text: "firasaz",
  });
  return <div>Page Client says: {data.greeting}</div>;
};

export default PageClient;
