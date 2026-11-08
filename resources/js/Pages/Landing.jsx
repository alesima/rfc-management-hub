import React from "react";
import { Head, Link } from "@inertiajs/react";

const FEATURES = [
  {
    title: "Structured templates",
    text: "Motivation, proposal, impact analysis — the sections reviewers actually read.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    title: "Review workflow that ends",
    text: "Draft → review → approved or rejected. No proposal rots in a doc forever.",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Votes and discussion together",
    text: "Up/down votes plus threaded comments, next to the proposal — not in chat.",
    icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
  },
  {
    title: "Teams and roles",
    text: "Personal workspaces, member invites, seat limits, owner/admin roles.",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
  {
    title: "Decision audit trail",
    text: "Every status change is recorded with who, when, and why.",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Markdown and diagrams",
    text: "Rich rendering with code highlighting, Mermaid diagrams, and print mode.",
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  },
];

const STEPS = [
  { status: "Draft", text: "Author writes the proposal using the template." },
  { status: "Review", text: "Team discusses, comments, and votes." },
  { status: "Approved", text: "Admins record the decision with rationale." },
];

export default function Landing({ stats = { rfcs: 0, teams: 0, decisions: 0 } }) {
  return (
    <div className="min-h-screen bg-purple-50">
      <Head title="RFC Management Hub" />

      <header className="max-w-5xl mx-auto flex items-center justify-between px-4 py-6">
        <span className="text-xl font-semibold text-indigo-700">
          RFC Management Hub
        </span>
        <nav className="flex items-center gap-2">
          <Link
            href={route("rfcs.index")}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Browse RFCs
          </Link>
          <Link
            href={route("login")}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Sign in
          </Link>
          <Link
            href={route("register")}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4">
        <section className="text-center py-16">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            Design docs your team
            <br />
            actually finishes.
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Write RFCs, collect votes, and record decisions in one place —
            instead of losing them across docs, threads, and meetings.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href={route("register")}
              className="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Start writing RFCs
            </Link>
            <Link
              href={route("rfcs.index")}
              className="px-6 py-3 font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              Browse public RFCs
            </Link>
          </div>
          <div className="mt-10 flex justify-center gap-10 text-center">
            {[
              [stats.rfcs, "RFCs published"],
              [stats.teams, "Teams"],
              [stats.decisions, "Decisions recorded"],
            ].map(([n, label]) => (
              <div key={label}>
                <p className="text-3xl font-bold text-indigo-700">{n}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
            Everything a review needs
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl shadow-sm p-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-indigo-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={f.icon}
                  />
                </svg>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
            From draft to decision
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.status} className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full bg-indigo-100 text-indigo-700 mb-3">
                  {i + 1} · {s.status}
                </span>
                <p className="text-gray-600 text-sm">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 text-center">
          <div className="bg-indigo-700 rounded-3xl px-8 py-12 text-white">
            <h2 className="text-3xl font-bold mb-3">
              Stop losing decisions in chat.
            </h2>
            <p className="text-indigo-200 mb-8">
              Create a workspace, invite the team, publish your first RFC today.
            </p>
            <Link
              href={route("register")}
              className="inline-block px-8 py-3 font-semibold text-indigo-700 bg-white rounded-xl hover:bg-indigo-50 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-8 flex items-center justify-between text-sm text-gray-500">
        <span>RFC Management Hub</span>
        <div className="flex gap-4">
          <Link href={route("rfcs.index")} className="hover:text-gray-800">
            RFCs
          </Link>
          <Link href={route("login")} className="hover:text-gray-800">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
