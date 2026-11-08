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
    { key: "list", label: "RFCs" },
    { key: "detail", label: "View" },
    { key: "edit", label: "Edit" },
    { key: "submit", label: "New RFC" },
    ...(user && teams.length > 0 ? [{ key: "team", label: "Team" }] : []),
  ].filter((tab) =>
    editingRFC && user ? tab.key !== "submit" : tab.key !== "edit"
  );

  const tabContent = {
    list: (
      <RFCList
        user={user}
        rfcs={rfcList}
        onRFCSelect={handleRFCSelect}
        onNew={handleNewSubmission}
      />
    ),
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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 mb-4 print:hidden">
        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex-grow min-w-[200px]">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
              placeholder="Search title or summary..."
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select rounded-full border-gray-200 bg-gray-100 text-sm focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer"
              title="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="review">In review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => setStaleOnly(!staleOnly)}
            title="Reviews open for more than 14 days"
            className={`px-3 py-2 text-sm font-medium rounded-full border transition-colors ${
              staleOnly
                ? "bg-orange-100 border-orange-300 text-orange-800"
                : "bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-800"
            }`}
          >
            Stale
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4 print:hidden">
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        <button
          onClick={handleNewSubmission}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          + New RFC
        </button>
      </div>
      {activeTab === "list" && (
        <>
          <p className="text-sm text-gray-500 mb-3">
            {rfcList.length} RFC{rfcList.length === 1 ? "" : "s"}
            {searchTerm && (
              <>
                {" "}matching “<span className="font-medium text-gray-700">{searchTerm}</span>”
              </>
            )}
          </p>
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
