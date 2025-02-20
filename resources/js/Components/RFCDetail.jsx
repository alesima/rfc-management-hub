import React, { useState } from "react";
import CommentList from "./CommentList";
import CommentForm from "./CommentSubmitForm";
import LoginPrompt from "./LoginPrompt";
import TagList from "./TagList";
import RFCSection from "./RFCSection";
import VoteControls from "./VoteControls";

const RFCDetail = ({ sections, rfc, user, onEdit, onDelete }) => {
  const [comments, setComments] = useState(rfc.comments);

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
      <div className="md:p-6 p-2">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{rfc.title}</h1>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600 transition-colors"
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

            {user && (
              <>
                <button
                  onClick={() => onEdit(rfc)}
                  className="flex items-center justify-center bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600 transition-colors print:hidden"
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

                <button
                  onClick={() => onDelete(rfc)}
                  className="flex items-center justify-center bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors print:hidden"
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
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Version</h2>
            <p className="text-gray-600">{rfc.version}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Author</h2>
            <p className="text-gray-600">{rfc.username}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Created</h2>
            <p className="text-gray-600">
              {new Date(rfc.created_at).toLocaleTimeString()}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700">
              Last Updated
            </h2>
            <p className="text-gray-600">
              {new Date(rfc.updated_at).toLocaleTimeString()}
            </p>
          </div>
        </div>

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
