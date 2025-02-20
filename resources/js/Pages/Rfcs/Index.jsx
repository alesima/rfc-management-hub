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
import TabBar from "@/Components/TabBar";

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
    setActiveTab("edit");
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

  const tabs = [
    { key: "list", icon: "📄 ", label: "List RFC" },
    { key: "detail", icon: "🔍 ", label: "View RFC" },
    { key: "edit", icon: "✏️ ", label: "Edit RFC" },
    { key: "submit", icon: "➕ ", label: "Submit RFC" },
  ].filter((tab) =>
    editingRFC && user ? tab.key !== "submit" : tab.key !== "edit"
  );

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
    [editingRFC && user ? "edit" : "submit"]: user ? (
      <SubmitRFCForm
        tags={tags}
        sections={sections}
        rfc={editingRFC}
        onSubmissionSuccess={handleSubmissionSuccess}
      />
    ) : (
      <LoginPrompt
        title={`${editingRFC && user ? "Edit" : "Submit"} an RFC`}
        message={`You must be logged in to ${
          editingRFC && user ? "edit" : "submit"
        } an RFC.`}
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
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
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
