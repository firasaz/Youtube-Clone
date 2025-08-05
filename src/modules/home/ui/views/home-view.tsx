import { CategoriesSection } from "../sections/categories-section";

interface HomeViewProps {
  categoryId?: string;
}

export const HomeView = ({ categoryId }: HomeViewProps) => {
  return (
    <div className="flex flex-col gap-y-6 px-4 pt-2.5 mx-auto mb-10 max-w-[2400px]">
      <CategoriesSection categoryId={categoryId} />
    </div>
  );
};
