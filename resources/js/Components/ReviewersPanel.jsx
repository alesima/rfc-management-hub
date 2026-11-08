import React from "react";
import { router, useForm } from "@inertiajs/react";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  changes_requested: "bg-red-100 text-red-800",
};

export default function ReviewersPanel({ rfc, user }) {
  const { data, setData, post, reset, processing, errors } = useForm({ email: "" });
  const quorum = rfc.quorum ?? { requested: 0, approvals: 0, required: 0, blocking: false };
  const canManage = rfc.can?.update ?? false;

  const request = (e) => {
    e.preventDefault();
    post(route("rfcs.reviewers.store", rfc.id), {
      preserveScroll: true,
      onSuccess: () => reset("email"),
    });
  };

  const respond = (reviewerId, status) => {
    router.patch(
      route("rfcs.reviewers.update", [rfc.id, reviewerId]),
      { status },
      { preserveScroll: true }
    );
  };

  const remove = (reviewerId) => {
    router.delete(route("rfcs.reviewers.destroy", [rfc.id, reviewerId]), {
      preserveScroll: true,
    });
  };

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Reviewers</h2>
        {quorum.requested > 0 && (
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              quorum.blocking
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {quorum.approvals}/{quorum.required} approvals
            {quorum.blocking ? " · blocked" : " · ready"}
          </span>
        )}
      </div>

      {(rfc.reviewers ?? []).length === 0 ? (
        <p className="text-sm text-gray-500">
          No reviewers requested. Anyone with access can still comment and vote.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {(rfc.reviewers ?? []).map((r) => (
            <li key={r.id} className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">{r.name}</span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                    STATUS_STYLES[r.status] ?? STATUS_STYLES.pending
                  }`}
                >
                  {r.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {rfc.can?.respond && r.id === user?.id && r.status === "pending" && (
                  <>
                    <button
                      onClick={() => respond(r.id, "approved")}
                      className="px-2 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => respond(r.id, "changes_requested")}
                      className="px-2 py-1 text-xs rounded-md bg-white border border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Request changes
                    </button>
                  </>
                )}
                {canManage && (
                  <button
                    onClick={() => remove(r.id)}
                    className="text-xs text-gray-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <form onSubmit={request} className="mt-3 flex gap-2 print:hidden">
          <input
            type="email"
            required
            value={data.email}
            onChange={(e) => setData("email", e.target.value)}
            placeholder="reviewer@company.com"
            className="flex-grow p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={processing || !data.email.trim()}
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            Request review
          </button>
        </form>
      )}
      {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
    </div>
  );
}
