import React, { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import MarkdownEditor from "./MarkdownEditor";
import SectionSelector from "./SectionSelector";
import TagInput from "./TagInput";
import MarkdownSectionField from "./MarkdownSectionField";

export default function SubmitRFCForm({
  tags,
  sections,
  rfc,
  onSubmissionSuccess,
}) {
  const parsedContent = (() => {
    try {
      return typeof rfc?.content === "string"
        ? JSON.parse(rfc.content)
        : rfc?.content || {};
    } catch {
      return {};
    }
  })();

  const initialFormData = sections.reduce(
    (acc, section) => {
      acc[section.name] = parsedContent[section.name] || "";
      return acc;
    },
    {
      title: rfc?.title || "",
      tags: rfc?.tags || [],
      summary: rfc?.summary || "",
    }
  );

  const { data, setData, post, put, processing, errors } = useForm(initialFormData);

  const [preview, setPreview] = useState("");
  const [selectedSections, setSelectedSections] = useState(
    rfc
      ? Object.keys(parsedContent)
      : sections
          .filter((section) => section.default)
          .map((section) => section.name)
  );

  useEffect(() => {
    setPreview(
      selectedSections
        .map((section) => {
          const label =
            sections.find((s) => s.name === section)?.label || section;
          const content = data[section] || "";
          return `# ${label}\n${content}`;
        })
        .join("\n\n")
    );
  }, [selectedSections, data, sections]);

  const handleSelectionToggle = (sectionName) => {
    setSelectedSections((prevSelected) =>
      prevSelected.includes(sectionName)
        ? prevSelected.filter((name) => name !== sectionName)
        : [...prevSelected, sectionName]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const routeName = rfc ? "rfcs.update" : "rfcs.store"; // Determine route
    const method = rfc ? put : post; // Determine HTTP method

    method(route(routeName, { id: rfc?.id }), {
      ...data,
      preserveScroll: true,
      onSuccess: () => {
        setData(initialFormData);
        onSubmissionSuccess();
      },
    });
  };

  return (
    <div className="md:p-6 p-2">
      <h1 className="text-3xl font-bold text-indigo-700 mb-4">
        {rfc ? "Edit RFC" : "Submit New RFC"}
      </h1>

      <SectionSelector
        sections={sections}
        selectedSections={selectedSections}
        onToggle={handleSelectionToggle}
      />

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={data.title}
            onChange={(e) => setData("title", e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.title && (
            <div className="text-red-500 text-sm mt-1">{errors.title}</div>
          )}
        </div>

        <TagInput
          tags={data.tags}
          allTags={tags}
          onAddTag={(tag) => setData("tags", [...data.tags, tag])}
          onRemoveTag={(tag) =>
            setData(
              "tags",
              data.tags.filter((t) => t !== tag)
            )
          }
        />

        <div className="mb-4">
          <label
            htmlFor="summary"
            className="block text-gray-700 font-bold mb-2"
          >
            Summary
          </label>
          <textarea
            id="summary"
            value={data.summary}
            rows="4"
            maxLength={255}
            onChange={(e) => setData("summary", e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.summary && (
            <div className="text-red-500 text-sm mt-1">{errors.summary}</div>
          )}
          <p className="text-gray-500 text-sm mt-1">
            {255 - data.summary?.length} characters remaining
          </p>
        </div>

        {selectedSections.map((section) => (
          <MarkdownSectionField
            key={section}
            name={section}
            label={sections.find((s) => s.name === section).label}
            value={data[section]}
            onChange={setData}
            error={errors[section]}
          />
        ))}

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Preview</h3>
          <MarkdownEditor
            value={preview}
            onChange={(value) => setPreview(value)}
            rows={10}
            previewMode={true}
          />
        </div>
        <button
          type="submit"
          disabled={processing}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {processing
            ? rfc
              ? "Updating..."
              : "Submitting..."
            : rfc
            ? "Update RFC"
            : "Submit RFC"}
        </button>
      </form>
    </div>
  );
}
