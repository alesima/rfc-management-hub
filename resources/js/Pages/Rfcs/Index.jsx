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
import TeamPanel from "@/Components/TeamPanel";

export default function Index({
  user,
  rfcs,
  tags,
  sections,
  teams = [],
  filters = {},
  initialSelectedRFC = null,
}) {
  const [searchTerm, setSearchTerm] = useState(filters.q ?? "");
  const [statusFilter, setStatusFilter] = useState(filters.status ?? "all");
  const [staleOnly, setStaleOnly] = useState(filters.stale ?? false);
  const [activeTab, setActiveTab] = useState(
    initialSelectedRFC ? "detail" : "list"
  );
  const [selectedRFC, setSelectedRFC] = useState(null);
  const [editingRFC, setEditingRFC] = useState(null);
  const [rfcToDelete, setRFCToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const rfcList = rfcs;

  useEffect(() => {
    if (initialSelectedRFC) {
      setSelectedRFC(initialSelectedRFC);
      setActiveTab("detail");
    }
  }, [initialSelectedRFC]);

  useEffect(() => {
    const t = setTimeout(() => {
      router.get(
        route("rfcs.index"),
        {
          q: searchTerm || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          stale: staleOnly || undefined,
        },
        { preserveState: true, replace: true, preserveScroll: true }
      );
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, statusFilter, staleOnly]);

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

  const handleNewSubmission = () => {
    setEditingRFC(null);
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
        setIsModalOpen(false);
        setActiveTab("list");
        setSelectedRFC(null);
      },
    });
  };

  const handleSubmissionSuccess = () => {
    setActiveTab("list");
    router.visit(route("rfcs.index"), {
      preserveState: true,
    });
  };

  const teamName =
    teams.find((t) => t.id === selectedRFC?.team_id)?.name ??
    teams[0]?.name ??
    null;
  const currentTeam =
    teams.find((t) => t.id === selectedRFC?.team_id) ?? teams[0] ?? null;

  const tabs = [
    { key: "list", icon: "📄 ", label: "List RFC" },
    { key: "detail", icon: "🔍 ", label: "View RFC" },
    { key: "edit", icon: "✏️ ", label: "Edit RFC" },
    { key: "submit", icon: "➕ ", label: "Submit RFC" },
    ...(user && teams.length > 0
      ? [{ key: "team", icon: "👥 ", label: "Team" }]
      : []),
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
        onNewRFC={handleNewSubmission}
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
    team: <TeamPanel team={currentTeam} user={user} />,
  };

  return (
    <AppLayout
      title={selectedRFC ? `RFC: ${selectedRFC.title}` : "RFC Management Hub"}
      user={user}
      teamName={teamName}
    >
      <div className="flex gap-2">
        <div className="flex-grow">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleSearchFocus}
            placeholder="Search RFCs..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          title="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="review">In review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="archived">Archived</option>
        </select>
        <label
          className="flex items-center gap-1 px-2 text-sm text-gray-600 whitespace-nowrap cursor-pointer"
          title="Reviews open for more than 14 days"
        >
          <input
            type="checkbox"
            checked={staleOnly}
            onChange={(e) => setStaleOnly(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Stale
        </label>
      </div>
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
