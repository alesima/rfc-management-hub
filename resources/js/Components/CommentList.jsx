import React from "react";
import ReactMarkdown from "react-markdown";
import { handleDaysAgo } from "@/Utils/DateUtils";

const CommentList = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return <p className="text-gray-500 my-4">No comments yet.</p>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Comments</h2>
      {comments.map((comment) => (
        <div key={comment.id} className="mb-4 p-4 border rounded-md bg-gray-50">
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-semibold text-gray-700">
              {comment.username}
            </span>
            <span className="text-sm text-gray-500">
              {handleDaysAgo(comment.created_at)}
            </span>
          </div>
          <div className="text-gray-800">
            <ReactMarkdown className="prose max-w-none">
              {comment.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;
