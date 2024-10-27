import { useState } from "react";

export default function TagInput({ tags, allTags, onAddTag, onRemoveTag }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  const handleTagInputFocus = () => {
    setIsFocused(true);
    setSuggestions(allTags.filter((tag) => !tags.includes(tag)));
  };

  const handleTagInputBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
    }, 100);
  };

  const addTag = (tag) => {
    onAddTag(tag);
    setSuggestions([]);
  };

  return (
    <div className="mb-4">
      <label htmlFor="tags" className="block text-gray-700 font-bold mb-2">
        Tags
      </label>
      <div className="flex flex-wrap mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-indigo-100 text-indigo-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              className="ml-1 text-indigo-600 hover:text-indigo-800"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          id="tags"
          onFocus={handleTagInputFocus}
          onBlur={handleTagInputBlur}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Add tags..."
        />
        {isFocused && suggestions.length > 0 && (
          <ul
            className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            {suggestions.map((tag) => (
              <li
                key={tag}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => addTag(tag)}
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
