import React from "react";

const TagList = ({ tags }) => (
  <div className="mt-6">
    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Tags</h2>
    <div className="flex flex-wrap">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="bg-indigo-100 text-indigo-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded"
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

export default TagList;
