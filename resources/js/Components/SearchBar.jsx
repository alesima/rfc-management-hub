import React from "react";

export default function SearchBar({
  value,
  onFocus,
  onChange,
  placeholder = "Search...",
}) {
  return (
    <div className="relative flex">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        className="flex-grow pl-10 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        value={value}
        onChange={onChange}
        onFocus={onFocus}
      />
    </div>
  );
}
