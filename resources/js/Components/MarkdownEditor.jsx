import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Mermaid } from "mdx-mermaid/lib/Mermaid";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

const MarkdownEditor = ({
  value,
  onChange,
  rows = 10,
  previewMode = false,
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef(null);
  const editorRef = useRef(null);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleSelect = () => {
    setSelectionStart(textareaRef.current.selectionStart);
    setSelectionEnd(textareaRef.current.selectionEnd);
  };

  useEffect(() => {
    setIsToolbarVisible(!previewMode);
    setIsPreview(previewMode);
  }, [previewMode]);

  const insertMarkdown = (prefix, suffix = "") => {
    // If no suffix is provided, treat it as a left-only markdown (e.g., H1, blockquote)
    if (!suffix) {
      // Find the start and end of the current line (for markdown that only places a sign to the left)
      const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const lineEnd = value.indexOf("\n", selectionEnd);
      const selectedLine = value.substring(
        lineStart,
        lineEnd === -1 ? value.length : lineEnd
      );

      const beforeLine = value.substring(0, lineStart);
      const afterLine = value.substring(
        lineEnd === -1 ? value.length : lineEnd
      );

      const hasPrefix = selectedLine.startsWith(prefix);
      const newValue = hasPrefix
        ? beforeLine +
          selectedLine.substring(prefix.length).trimStart() +
          afterLine
        : beforeLine + prefix + " " + selectedLine.trim() + afterLine;

      // Adjust cursor position for left-only markdown
      const adjustedSelectionStart = hasPrefix
        ? selectionStart - prefix.length
        : selectionStart + prefix.length + 1;
      const adjustedSelectionEnd = hasPrefix
        ? selectionEnd - prefix.length
        : selectionEnd + prefix.length + 1;

      onChange(newValue);

      setTimeout(() => {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          adjustedSelectionStart,
          adjustedSelectionEnd
        );
      }, 0);
      return;
    }

    // For wrapping markdown (e.g., bold, italic)
    const wordBoundaryBefore = value.lastIndexOf(" ", selectionStart - 1) + 1;
    const wordBoundaryAfter = value.indexOf(" ", selectionEnd);
    const selectedText = value.substring(
      wordBoundaryBefore,
      wordBoundaryAfter === -1 ? value.length : wordBoundaryAfter
    );

    // Find the start and end of the selected word
    const beforeText = value.substring(0, wordBoundaryBefore);
    const afterText = value.substring(
      wordBoundaryAfter === -1 ? value.length : wordBoundaryAfter
    );

    // Check if the word is already wrapped with the markdown
    const hasPrefixAndSuffix =
      selectedText.startsWith(prefix) && selectedText.endsWith(suffix);

    // Either remove or add the markdown
    const newValue = hasPrefixAndSuffix
      ? beforeText +
        selectedText.substring(
          prefix.length,
          selectedText.length - suffix.length
        ) +
        afterText
      : beforeText + prefix + selectedText + suffix + afterText;

    // Calculate new selection range based on markdown being added or removed
    const adjustedSelectionStart =
      wordBoundaryBefore +
      (hasPrefixAndSuffix ? -prefix.length : prefix.length);
    const adjustedSelectionEnd =
      wordBoundaryBefore +
      selectedText.length +
      (hasPrefixAndSuffix ? -suffix.length : prefix.length);

    // Update the textarea value
    onChange(newValue);

    // Focus and set selection range after applying the markdown
    setTimeout(() => {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        adjustedSelectionStart,
        adjustedSelectionEnd
      );
    }, 0);
  };

  const insertTable = () => {
    insertMarkdown(
      `
      | Column 1 | Column 2 | Column 3 |
      | -------- | -------- | -------- |
      | Row 1    | Cell 2   | Cell 3   |
      | Row 2    | Cell 5   | Cell 6   |
      `
    );
  };

  const toolbarItems = [
    { icon: "B", action: () => insertMarkdown("**", "**"), title: "Bold" },
    { icon: "I", action: () => insertMarkdown("*", "*"), title: "Italic" },
    {
      icon: "S",
      action: () => insertMarkdown("~~", "~~"),
      title: "Strikethrough",
    },
    { icon: "H1", action: () => insertMarkdown("# "), title: "Heading 1" },
    { icon: "H2", action: () => insertMarkdown("## "), title: "Heading 2" },
    { icon: "H3", action: () => insertMarkdown("### "), title: "Heading 3" },
    { icon: "•", action: () => insertMarkdown("- "), title: "Bullet List" },
    { icon: "1.", action: () => insertMarkdown("1. "), title: "Numbered List" },
    { icon: "> ", action: () => insertMarkdown("> "), title: "Blockquote" },
    {
      icon: "``",
      action: () => insertMarkdown("`", "`"),
      title: "Inline Code",
    },
    {
      icon: "```",
      action: () => insertMarkdown("```\n", "\n```"),
      title: "Code Block",
    },
    {
      icon: "Link",
      action: () => insertMarkdown("[", "](url)"),
      title: "Link",
    },
    {
      icon: "Image",
      action: () => insertMarkdown("![alt text](", ")"),
      title: "Image",
    },
    {
      icon: "Table",
      action: insertTable,
      title: "Table",
    },
    {
      icon: "HR",
      action: () => insertMarkdown("\n---\n"),
      title: "Horizontal Rule",
    },
    {
      icon: "M",
      action: () => insertMarkdown("```mermaid\n", "\n```"),
      title: "Mermaid Diagram",
    },
  ];

  return (
    <div
      className={`markdown-editor ${
        isFullscreen ? "fixed inset-0 z-50 bg-white" : ""
      }`}
      ref={editorRef}
    >
      {isToolbarVisible && (
        <div className="toolbar flex flex-wrap space-x-2 mb-2 p-2 bg-gray-100 rounded">
          {toolbarItems.map((item, index) => (
            <button
              type="button"
              key={index}
              onClick={item.action}
              className="px-2 py-1 bg-white rounded hover:bg-gray-200 focus:outline-none"
              title={item.title}
            >
              {item.icon}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`px-2 py-1 rounded focus:outline-none ${
              isPreview
                ? "bg-blue-500 text-white"
                : "bg-white hover:bg-gray-200"
            }`}
            title={isPreview ? "Edit" : "Preview"}
          >
            {isPreview ? "Edit" : "Preview"}
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-2 py-1 bg-white rounded hover:bg-gray-200 focus:outline-none"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? "⇲" : "⇱"}
          </button>
        </div>
      )}
      <div
        className={`editor-content ${
          isFullscreen ? "h-[calc(100vh-100px)]" : ""
        }`}
      >
        {isPreview ? (
          <div
            className="preview prose max-w-none p-4 border rounded-md overflow-auto"
            style={{
              height: isFullscreen ? "calc(100% - 40px)" : 'auto',
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-xl font-semibold mt-3 mb-2" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-lg font-semibold mt-2 mb-2" {...props} />
                ),
                p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside mb-2" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside mb-2" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="border-l-4 border-gray-300 pl-4 mb-2"
                    {...props}
                  />
                ),
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  if (!inline && match && match[1] === "mermaid") {
                    return (
                      <Mermaid chart={String(children).replace(/\n$/, "")} />
                    );
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {value}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            onSelect={handleSelect}
            rows={isFullscreen ? 20 : rows}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            style={{ height: isFullscreen ? "calc(100% - 40px)" : "auto" }}
          />
        )}
      </div>
      <div className="flex justify-between text-sm text-gray-500 mt-2">
        <span>{(value || "").length} characters</span>
        <span>
          {(value || "").split(/\s+/).filter(Boolean).length} words
        </span>{" "}
      </div>
    </div>
  );
};

export default MarkdownEditor;
