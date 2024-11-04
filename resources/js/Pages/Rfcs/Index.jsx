import React, { useEffect, useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import RFCList from "@/Components/RFCList";
import RFCDetail from "@/Components/RFCDetail";
import SubmitRFCForm from "@/Components/RFCSubmitForm";
import LoginPrompt from "@/Components/LoginPrompt";
import { router } from "@inertiajs/react";
import DetailPrompt from "@/Components/DetailPrompt";
import ConfirmationModal from "@/Components/ConfirmationModal";
import SearchBar from "@/Components/SearchBar";

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
  const [editingRFC, setEditingRFC] = useState(null);
  const [rfcToDelete, setRFCToDelete] = useState(null);
  const [rfcList, setRfcList] = useState(rfcs);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (initialSelectedRFC) {
      setSelectedRFC(initialSelectedRFC);
      setActiveTab("detail");
    }
  }, [initialSelectedRFC]);

  useEffect(() => {
    const filteredRFCs = rfcs.filter((rfc) =>
      rfc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setRfcList(filteredRFCs);
  }, [searchTerm, rfcs]);

  const handleRFCSelect = (rfc) => {
    setSelectedRFC(rfc);
    setActiveTab("detail");
    router.visit(route("rfcs.show", rfc.id), {
      preserveState: true,
      replace: true,
    });
  };

  const handleSearchFocus = () => {
    setActiveTab("list");
  };

  const handleEdit = (rfc) => {
    setEditingRFC(rfc);
    setActiveTab("submit");
  };

  const openDeleteConfirmationModal = (rfc) => {
    setRFCToDelete(rfc);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    router.delete(route("rfcs.destroy", rfcToDelete.id), {
      preserveState: true,
      onSuccess: () => {
        setRfcList(rfcList.filter((rfc) => rfc.id !== rfcToDelete.id));
        setIsModalOpen(false);
        setActiveTab("list");
      },
    });
  };

  const handleSubmissionSuccess = () => {
    setActiveTab("list");
    router.visit(route("rfcs.index"), {
      preserveState: true,
    });
  };

  const tabContent = {
    list: <RFCList user={user} rfcs={rfcList} onRFCSelect={handleRFCSelect} />,
    detail: selectedRFC ? (
      <RFCDetail
        sections={sections}
        user={user}
        rfc={selectedRFC}
        onEdit={handleEdit}
        onDelete={openDeleteConfirmationModal}
      />
    ) : (
      <DetailPrompt />
    ),
    submit: user ? (
      <SubmitRFCForm
        tags={tags}
        sections={sections}
        rfc={editingRFC}
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
      <SearchBar
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={handleSearchFocus}
        placeholder="Search RFCs..."
      />
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

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete RFC"
        message="Are you sure you want to delete this RFC? This action cannot be undone."
      />
    </AppLayout>
  );
}
