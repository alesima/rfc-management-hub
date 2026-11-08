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
    <div>
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
            <select
              value={data.role}
              onChange={(e) => setData("role", e.target.value)}
              className="p-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
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
    </div>
  );
}
