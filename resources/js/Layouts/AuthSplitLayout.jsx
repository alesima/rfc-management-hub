import React from "react";
import { Link } from "@inertiajs/react";

const BULLETS = [
  {
    title: "Structured RFC templates",
    text: "Motivation, proposal, impact — the sections reviewers expect.",
  },
  {
    title: "Review workflow that ends",
    text: "Draft → review → approved, with every decision recorded.",
  },
  {
    title: "Votes and discussion in one place",
    text: "No more decisions buried in chat threads.",
  },
];

export default function AuthSplitLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-purple-50">
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-indigo-700 text-white p-12">
        <Link href={route("home")} className="text-2xl font-semibold">
          RFC Management Hub
        </Link>

        <div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Design docs your team actually finishes.
          </h2>
          <p className="text-indigo-200 text-lg mb-10">
            Write RFCs, collect votes, and record decisions — without losing
            the thread.
          </p>
          <ul className="space-y-6">
            {BULLETS.map((b) => (
              <li key={b.title} className="flex gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 text-indigo-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-semibold">{b.title}</p>
                  <p className="text-indigo-200 text-sm">{b.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-indigo-300 text-sm">
          Free for personal workspaces · No credit card
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <Link
          href={route("home")}
          className="lg:hidden text-2xl font-semibold text-indigo-700 mb-8"
        >
          RFC Management Hub
        </Link>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
