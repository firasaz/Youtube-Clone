import { SearchIcon } from "lucide-react";
import React from "react";

export const SearchInput = () => {
  return (
    <form className="flex w-full max-w-[600px]">
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search"
          className="w-full pl-4 py-2 rounded-l-full border focus:outline-none focus:border-blue-700"
        />
      </div>
      <button
        type="submit"
        className="px-5 py-2.5 border border-l-0 rounded-r-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SearchIcon className="size-5" />
      </button>
    </form>
  );
};
