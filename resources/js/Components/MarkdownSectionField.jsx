import MarkdownEditor from "./MarkdownEditor";

export default function MarkdownSectionField({
  name,
  label,
  value,
  onChange,
  error,
  rows = 4,
}) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-gray-700 font-bold mb-2">
        {label}
      </label>
      <MarkdownEditor
        value={value || ""}
        onChange={(val) => onChange(name, val)}
        rows={rows}
      />
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
}
