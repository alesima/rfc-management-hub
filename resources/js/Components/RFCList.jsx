import React from "react";
import { Link } from "@inertiajs/react";
import { handleDaysAgo } from "@/Utils/DateUtils";
import TagList from "./TagList";
import VoteControls from "./VoteControls";
import StatusBadge from "./StatusBadge";

export default function RFCList({ user, rfcs, onRFCSelect }) {
  return (
    <div className="space-y-4">
      {rfcs.map((rfc) => (
        <div
          key={rfc.id}
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-800">{rfc.title}</h3>
            <StatusBadge status={rfc.status} />
            {rfc.is_stale && (
              <span
                className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800"
                title="In review for more than 14 days"
              >
                stale
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Submitted by {rfc.username} • {handleDaysAgo(rfc.created_at)}
          </p>

          <p className="text-gray-700 mt-2">{rfc.summary}</p>

          {rfc.tags && rfc.tags.length > 0 && (
            <TagList tags={rfc.tags} noTitle={true} />
          )}

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
            className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block transition-colors duration-200"
          >
            Read more
          </Link>
        </div>
      ))}
    </div>
  );
}
