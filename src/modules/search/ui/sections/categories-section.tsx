"use client";

import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  CategoriesSkeleton,
  FilterCarousel,
} from "@/components/filter-carousel";

interface CategoriesSectionProps {
  categoryId?: string;
}

export const CategoriesSection = ({ categoryId }: CategoriesSectionProps) => {
  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <ErrorBoundary fallback={<div>Error...</div>}>
        <CategoriesSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CategoriesSectionSuspense = ({ categoryId }: CategoriesSectionProps) => {
  const [data] = trpc.videoCategories.getMany.useSuspenseQuery();
  const router = useRouter();

  const categories = data.map(({ id, name }) => ({
    value: id,
    label: name,
  }));
  const handleCategorySelect = (value: string | null) => {
    const url = new URL(window.location.href);

    if (value) url.searchParams.set("categoryId", value);
    else url.searchParams.delete("categoryId");

    router.push(url.toString());
  };

  return (
    <FilterCarousel
      onSelectAction={handleCategorySelect}
      value={categoryId}
      data={categories}
    />
  );
};
