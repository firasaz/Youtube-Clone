"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { APP_URL } from "@/constants";

export const SearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || ""; // check if the url includes "query" param and set the default value of the input state to it
  const categoryId = searchParams.get("categoryId") || ""; // check if the url includes the "categoryId" param and use it in the input search functionality

  const [value, setValue] = useState(query);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = new URL("/search", APP_URL);
    const newQuery = value.trim();

    url.searchParams.set("query", encodeURIComponent(newQuery));

    if (categoryId) url.searchParams.set("categoryId", categoryId);
    if (newQuery === "") url.searchParams.delete("query");

    setValue(newQuery);
    router.push(url.toString());
  };

  return (
    <form className="flex w-full max-w-[600px]" onSubmit={handleSearch}>
      <div className="relative w-full">
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          type="text"
          placeholder="Search"
          className="w-full pl-4 py-2 rounded-l-full border focus:outline-none focus:border-blue-700"
        />
        {value && (
          <Button
            type="button"
            variant={"ghost"}
            size={"icon"}
            onClick={() => setValue("")}
            className="absolute right-2 top-1 rounded-full"
          >
            <XIcon className="text-gray-500" />
          </Button>
        )}
      </div>
      <button
        disabled={!value.trim()}
        type="submit"
        className="px-5 py-2.5 border border-l-0 rounded-r-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SearchIcon className="size-5" />
      </button>
    </form>
  );
};
