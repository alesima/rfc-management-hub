import React, { useState } from "react";
import CommentList from "./CommentList";
import CommentForm from "./CommentSubmitForm";
import LoginPrompt from "./LoginPrompt";
import TagList from "./TagList";
import RFCSection from "./RFCSection";
import VoteControls from "./VoteControls";
import StatusBadge from "./StatusBadge";
import StatusTransitions from "./StatusTransitions";

import ReviewersPanel from "./ReviewersPanel";

const RFCDetail = ({ sections, rfc, user, onEdit, onDelete }) => {
  const [comments, setComments] = useState(rfc.comments);
  const canUpdate = rfc.can?.update ?? !!user;
  const canDelete = rfc.can?.delete ?? !!user;

  const parsedContent = JSON.parse(rfc.content);

  const handleCommentSubmit = (content) => {
    setComments([
      ...comments,
      {
        id: comments[comments.length - 1].id + 1,
        content,
        username: user.name,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="overflow-hidden">
      <button
        onClick={() => window.history.back()}
        className="mb-3 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors print:hidden"
      >
        ← Back to list
      </button>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm md:p-6 p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={rfc.status} />
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                v{rfc.version}
              </span>
              {rfc.is_stale && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                  stale
                </span>
              )}
            </div>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 leading-tight">
              {rfc.title}
            </h1>
            {rfc.summary && (
              <p className="mt-2 text-gray-600 leading-relaxed">{rfc.summary}</p>
            )}
            <p className="mt-3 text-sm text-gray-500">
              by <span className="font-medium text-gray-700">{rfc.username}</span>
              {" · "}
              {new Date(rfc.created_at).toLocaleDateString()}
              {" · updated "}
              {new Date(rfc.updated_at).toLocaleDateString()}
            </p>
            <StatusTransitions rfc={rfc} />
          </div>
          <div className="flex md:flex-col gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
              title="Print"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 9V2h12v7M6 18h12M6 22h12M8 9h8v4H8z"
                />
              </svg>
              <span className="ml-2 hidden md:inline">Print</span>
            </button>

            {user && (canUpdate || canDelete) && (
              <>
                {canUpdate && (
                <button
                  onClick={() => onEdit(rfc)}
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium print:hidden"
                  title="Edit RFC"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M17.414 2.586a2 2 0 010 2.828l-10 10a2 2 0 01-.586.414l-4 1a1 1 0 01-1.272-1.272l1-4a2 2 0 01.414-.586l10-10a2 2 0 012.828 0zm-5.586 9.414L4 14l.586-.586 7.828-7.828L12 8.586z" />
                  </svg>
                  <span className="md:hidden block ml-2">Edit</span>
                </button>
                )}

                {canDelete && (
                <button
                  onClick={() => onDelete(rfc)}
                  className="flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium print:hidden"
                  title="Delete RFC"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 3a1 1 0 011-1h6a1 1 0 011 1h3a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5H3a1 1 0 110-2h3zm3 3a1 1 0 10-2 0v9a1 1 0 102 0V6zm4 0a1 1 0 10-2 0v9a1 1 0 102 0V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="md:hidden block ml-2">Delete</span>
                </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm md:p-6 p-4">
        {rfc.decision && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-green-800">
                Decision: {rfc.decision.status}
              </h2>
              <a
                href={route("rfcs.decision.download", rfc.id)}
                className="px-3 py-1 text-sm rounded-md bg-green-700 text-white hover:bg-green-800 transition-colors print:hidden"
              >
                Download ADR
              </a>
            </div>
            <p className="text-sm text-green-700 mt-1">
              v{rfc.decision.rfc_version}
              {rfc.decision.decided_by ? ` · by ${rfc.decision.decided_by}` : ""}
              {rfc.decision.decided_at
                ? ` · ${new Date(rfc.decision.decided_at).toLocaleDateString()}`
                : ""}
            </p>
          </div>
        )}

        {sections
          .filter((section) => parsedContent[section.name])
          .map((section) => (
            <RFCSection
              key={section.name}
              title={section.label || section.name}
              content={parsedContent[section.name]}
            />
          ))}

        {rfc.tags && rfc.tags.length > 0 && <TagList tags={rfc.tags} />}

        <ReviewersPanel rfc={rfc} user={user} />

        <VoteControls
          rfcId={rfc.id}
          initialUpvotes={rfc.upvotes}
          initialDownvotes={rfc.downvotes}
          initialUserVote={rfc.user_vote}
          isAuthenticated={!!user}
        />

        <CommentList comments={comments} />

        {user ? (
          <CommentForm rfc={rfc} onSubmit={handleCommentSubmit} />
        ) : (
          <LoginPrompt
            title="Log In to Comment"
            message="You must be logged in to comment on this RFC."
          />
        )}
      </div>
    </div>
  );
};

export default RFCDetail;
