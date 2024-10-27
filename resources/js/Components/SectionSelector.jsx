import SectionCheckbox from "./SectionCheckbox";

export default function SectionSelector({
  sections,
  selectedSections,
  onToggle,
}) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        Select Sections
      </h3>
      <div className="flex flex-wrap">
        {sections.map((section) => (
          <SectionCheckbox
            key={section.name}
            section={section}
            isSelected={selectedSections.includes(section.name)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}
