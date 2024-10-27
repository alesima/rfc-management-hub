import React, { useEffect, useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import RFCList from "@/Components/RFCList";
import RFCDetail from "@/Components/RFCDetail";
import SubmitRFCForm from "@/Components/RFCSubmitForm";
import LoginPrompt from "@/Components/LoginPrompt";
import { router } from "@inertiajs/react";
import DetailPrompt from "@/Components/DetailPrompt";

export default function Index({
  user,
  rfcs,
  tags,
  sections,
  initialSelectedRFC = null,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(
    initialSelectedRFC ? "detail" : "list"
  );
  const [selectedRFC, setSelectedRFC] = useState(null);

  useEffect(() => {
    if (initialSelectedRFC) {
      setSelectedRFC(initialSelectedRFC);
      setActiveTab("detail");
    }
  }, [initialSelectedRFC]);

  const handleRFCSelect = (rfc) => {
    setSelectedRFC(rfc);
    setActiveTab("detail");
    router.visit(route("rfcs.show", rfc.id), {
      preserveState: true,
      replace: true,
    });
  };

  const handleSubmissionSuccess = () => {
    setActiveTab("list");
    router.visit(route("rfcs.index"), {
      preserveState: true,
    });
  };

  const tabContent = {
    list: <RFCList rfcs={rfcs} onRFCSelect={handleRFCSelect} />,
    detail: selectedRFC ? (
      <RFCDetail sections={sections} user={user} rfc={selectedRFC} />
    ) : (
      <DetailPrompt />
    ),
    submit: user ? (
      <SubmitRFCForm
        tags={tags}
        sections={sections}
        onSubmissionSuccess={handleSubmissionSuccess}
      />
    ) : (
      <LoginPrompt
        title={"Submit an RFC"}
        message={"You must be logged in to submit an RFC."}
      />
    ),
  };

  return (
    <AppLayout
      title={selectedRFC ? `RFC: ${selectedRFC.title}` : "RFC Management Hub"}
      user={user}
    >
      <div className="mb-6 flex">
        <input
          type="text"
          placeholder="Search RFCs..."
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="bg-indigo-500 text-white px-4 py-2 rounded-r-md hover:bg-indigo-600 transition-colors">
          Search
        </button>
      </div>
      <div className="flex justify-between md:mb-6">
        {["list", "detail", "submit"].map((tab) => (
          <button
            key={tab}
            className={`flex-1 mx-1 py-2 px-4 rounded-md border ${
              activeTab === tab
                ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "list" && "📄 "}
            {tab === "detail" && "🔍 "}
            {tab === "submit" && "➕ "}
            {tab.charAt(0).toUpperCase() + tab.slice(1)} RFC
          </button>
        ))}
      </div>
      {activeTab === "list" && (
        <>
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
            Recent RFCs
          </h2>
          {tabContent[activeTab]}
        </>
      )}
      {activeTab !== "list" && tabContent[activeTab]}
    </AppLayout>
  );
}
