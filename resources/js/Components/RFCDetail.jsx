import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Mermaid } from "mdx-mermaid/lib/Mermaid";
import rehypeRaw from "rehype-raw";
import CommentList from "./CommentList";
import CommentForm from "./CommentSubmitForm";
import LoginPrompt from "./LoginPrompt";
import TagList from "./TagList";
import RFCSection from "./RFCSection";

const RFCDetail = ({ sections, rfc, user }) => {
  const parsedContent = JSON.parse(rfc.content);
  const [comments, setComments] = useState(rfc.comments);

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

  return (
    <div className="overflow-hidden">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{rfc.title}</h1>

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
