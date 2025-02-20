import React from "react";

const TabBar = ({ tabs, activeTab, onTabChange }) => {
  const getButtonClass = (isActive) =>
    `flex-1 mx-1 py-2 px-4 rounded-md border ${
      isActive
        ? "bg-indigo-100 border-indigo-300 text-indigo-700"
        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="flex justify-between md:mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={getButtonClass(activeTab === tab.key)}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabBar;
