import React from "react";
import { router } from "@inertiajs/react";

const NEXT = {
  draft: ["review"],
  review: ["draft", "approved", "rejected"],
  approved: ["archived"],
  rejected: ["archived"],
  archived: [],
};

const LABELS = {
  review: "Request review",
  draft: "Back to draft",
  approved: "Approve",
  rejected: "Reject",
  archived: "Archive",
};

export default function StatusTransitions({ rfc }) {
  if (!rfc?.can?.change_status) {
    return null;
  }

  const options = NEXT[rfc.status ?? "draft"] ?? [];

  if (options.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3 print:hidden">
      {options.map((to) => (
        <button
          key={to}
          onClick={() =>
            router.patch(route("rfcs.status.update", rfc.id), {
              to_status: to,
            })
          }
          className="px-3 py-1 text-sm rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
        >
          {LABELS[to] ?? to}
        </button>
      ))}
    </div>
  );
}
