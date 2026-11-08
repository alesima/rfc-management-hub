import React from "react";
import { router, useForm } from "@inertiajs/react";

const ROLE_STYLES = {
  owner: "bg-purple-100 text-purple-800",
  admin: "bg-blue-100 text-blue-800",
  member: "bg-gray-100 text-gray-700",
};

export default function TeamPanel({ team, user }) {
  const { data, setData, post, reset, processing, errors } = useForm({
    email: "",
    role: "member",
  });

  if (!team) {
    return <p className="text-gray-500">No team yet.</p>;
  }

  const myRole = team.members?.find((m) => m.id === user?.id)?.pivot?.role;
  const canManage = ["owner", "admin"].includes(myRole);
  const seatsUsed = team.members?.length ?? 0;

  const quorumForm = useForm({ approval_quorum: team.approval_quorum ?? 1 });

  const saveQuorum = (e) => {
    e.preventDefault();
    quorumForm.patch(route("teams.settings.update", team.id), {
      preserveScroll: true,
    });
  };

  const invite = (e) => {
    e.preventDefault();
    post(route("teams.members.store", team.id), {
      preserveScroll: true,
      onSuccess: () => reset("email"),
    });
  };

  const remove = (memberId) => {
    router.delete(route("teams.members.destroy", [team.id, memberId]), {
      preserveScroll: true,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-indigo-700">{team.name}</h2>
        <span className="text-sm text-gray-500">
          {seatsUsed}/{team.seats_limit} seats · {team.plan} plan
        </span>
      </div>

      <ul className="divide-y divide-gray-200 mb-6">
        {(team.members ?? []).map((m) => (
          <li key={m.id} className="py-2 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">{m.name}</p>
              <p className="text-sm text-gray-500">{m.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                  ROLE_STYLES[m.pivot?.role] ?? ROLE_STYLES.member
                }`}
              >
                {m.pivot?.role ?? "member"}
              </span>
              {canManage && m.id !== user?.id && (
                <button
                  onClick={() => remove(m.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                  title={`Remove ${m.name}`}
                >
                  Remove
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {canManage ? (
        <form onSubmit={invite} className="print:hidden">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Invite by email
          </h3>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              placeholder="teammate@company.com"
              className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div>
              <select
                value={data.role}
                onChange={(e) => setData("role", e.target.value)}
                className="form-select rounded-xl border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={processing || !data.email.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {processing ? "Inviting..." : "Invite"}
            </button>
          </div>
          {(errors.email || errors.role) && (
            <p className="text-red-500 text-sm mt-2">
              {errors.email ?? errors.role}
            </p>
          )}
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          Only admins can invite or remove members.
        </p>
      )}

      {canManage && (
        <form onSubmit={saveQuorum} className="mt-6 print:hidden">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Review settings
          </h3>
          <div className="flex items-center gap-2">
            <label htmlFor="quorum" className="text-sm text-gray-600">
              Approvals required to merge a decision
            </label>
            <input
              id="quorum"
              type="number"
              min="1"
              max="10"
              value={quorumForm.data.approval_quorum}
              onChange={(e) => quorumForm.setData("approval_quorum", parseInt(e.target.value, 10) || 1)}
              className="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={quorumForm.processing}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
          {quorumForm.errors.approval_quorum && (
            <p className="text-red-500 text-sm mt-2">{quorumForm.errors.approval_quorum}</p>
          )}
        </form>
      )}
    </div>
  );
}
