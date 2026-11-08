import React from "react";

const COLORS = {
  draft: "bg-gray-100 text-gray-700",
  review: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  archived: "bg-slate-200 text-slate-600",
};

export default function StatusBadge({ status }) {
  const key = status ?? "draft";
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
        COLORS[key] ?? COLORS.draft
      }`}
    >
      {key}
    </span>
  );
}
