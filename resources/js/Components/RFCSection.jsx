import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Mermaid } from "mdx-mermaid/lib/Mermaid";
import rehypeRaw from "rehype-raw";
import rehypePrism from "rehype-prism-plus";

const RFCSection = ({ title, content }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h2>
      <ReactMarkdown
        className="prose max-w-none"
        rehypePlugins={[rehypeRaw, rehypePrism]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isMermaid = !inline && match && match[1] === "mermaid";

            return !inline && !isMermaid ? (
              <div className="relative">
                <button
                  onClick={() => handleCopyCode(String(children).trim())}
                  className="absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity"
                >
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <pre>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : isMermaid ? (
              <Mermaid chart={String(children).replace(/\n$/, "")} />
            ) : (
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
};

export default RFCSection;
