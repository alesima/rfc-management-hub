import React from "react";

const TabBar = ({ tabs, activeTab, onTabChange }) => {
  const getButtonClass = (isActive) =>
    `px-4 py-1.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
      isActive
        ? "bg-white shadow text-indigo-700"
        : "text-gray-500 hover:text-gray-800"
    }`;

  return (
    <div className="inline-flex rounded-full bg-gray-200/70 p-1 gap-1 print:hidden">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={getButtonClass(activeTab === tab.key)}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabBar;
