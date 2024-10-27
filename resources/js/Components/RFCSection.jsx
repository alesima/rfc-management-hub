import React from "react";
import ReactMarkdown from "react-markdown";
import { Mermaid } from "mdx-mermaid/lib/Mermaid";
import rehypeRaw from "rehype-raw";

const RFCSection = ({ title, content }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h2>
    <ReactMarkdown
      className="prose max-w-none"
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          if (!inline && match && match[1] === "mermaid") {
            return <Mermaid chart={String(children).replace(/\n$/, "")} />;
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export default RFCSection;
