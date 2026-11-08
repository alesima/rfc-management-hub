import React from "react";
import { Link } from "@inertiajs/react";
import { handleDaysAgo } from "@/Utils/DateUtils";
import TagList from "./TagList";
import VoteControls from "./VoteControls";
import StatusBadge from "./StatusBadge";

const STATUS_ACCENT = {
  draft: "border-l-gray-300",
  review: "border-l-amber-400",
  approved: "border-l-green-500",
  rejected: "border-l-red-400",
  archived: "border-l-slate-300",
};

const initialsOf = (name) =>
  (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function RFCList({ user, rfcs, onRFCSelect, onNew }) {
  if (rfcs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-lg font-semibold text-gray-800">No RFCs found</p>
        <p className="text-sm text-gray-500 mt-1 mb-5">
          Try a different search — or write the first one.
        </p>
        {onNew && (
          <button
            onClick={onNew}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            + New RFC
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rfcs.map((rfc) => (
        <article
          key={rfc.id}
          className={`bg-white rounded-2xl border border-gray-200 border-l-4 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer ${
            STATUS_ACCENT[rfc.status ?? "draft"] ?? STATUS_ACCENT.draft
          }`}
          onClick={() => onRFCSelect(rfc)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={rfc.status} />
            {rfc.is_stale && (
              <span
                className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800"
                title="In review for more than 14 days"
              >
                stale
              </span>
            )}
            {rfc.decision && (
              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                decided · {rfc.decision.status}
              </span>
            )}
            <span className="ml-auto text-xs text-gray-400">
              v{rfc.version}
            </span>
          </div>

          <h3 className="mt-2 text-xl font-semibold text-gray-900 leading-snug">
            {rfc.title}
          </h3>

          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
              {initialsOf(rfc.username)}
            </span>
            <span className="font-medium text-gray-700">{rfc.username}</span>
            <span>·</span>
            <span>{handleDaysAgo(rfc.created_at)}</span>
          </div>

          {rfc.summary && (
            <p className="mt-2 text-gray-600 text-[15px] leading-relaxed">
              {rfc.summary}
            </p>
          )}

          {rfc.tags && rfc.tags.length > 0 && (
            <div className="mt-3">
              <TagList tags={rfc.tags} noTitle={true} />
            </div>
          )}

          <div
            className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <VoteControls
              rfcId={rfc.id}
              initialUpvotes={rfc.upvotes}
              initialDownvotes={rfc.downvotes}
              initialUserVote={rfc.user_vote}
              isAuthenticated={!!user}
            />
            <Link
              href={route("rfcs.show", rfc.id)}
              onClick={(e) => {
                e.preventDefault();
                onRFCSelect(rfc);
              }}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors whitespace-nowrap"
            >
              Read more →
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
