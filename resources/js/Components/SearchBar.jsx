import React from "react";

export default function SearchBar({
  value,
  onFocus,
  onChange,
  placeholder = "Search...",
}) {
  return (
    <div className="mb-2 md:mb-6 flex">
      <input
        type="text"
        placeholder={placeholder}
        className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
        value={value}
        onChange={onChange}
        onFocus={onFocus}
      />
    </div>
  );
}
