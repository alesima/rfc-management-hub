import React from "react";
import { Head, Link } from "@inertiajs/react";
import AuthButtons from "@/Components/AuthButtons";

export default function AppLayout({ children, title, user, teamName = null }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Head title={title} />
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/85 backdrop-blur print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href={route("rfcs.index")} className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </span>
            <span className="font-bold text-gray-900 truncate">RFC Hub</span>
            {teamName && (
              <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 truncate max-w-[180px]">
                {teamName}
              </span>
            )}
          </Link>
          <AuthButtons user={user} />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
