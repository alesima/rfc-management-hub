export default function SectionCheckbox({ section, isSelected, onToggle }) {
  return (
    <label className="flex items-center mr-4 mb-2">
      <input
        type="checkbox"
        className="mr-2"
        checked={isSelected}
        onChange={() => onToggle(section.name)}
      />
      <span className="text-gray-700 font-bold">{section.label}</span>
    </label>
  );
}
