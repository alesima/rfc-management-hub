import React from "react";
import { Head } from "@inertiajs/react";
import AuthButtons from "@/Components/AuthButtons";

export default function AppLayout({ children, title, user, teamName = null }) {
  return (
    <div className="min-h-screen bg-purple-50 md:p-8">
      <Head title={title} />
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm md:p-6 p-2">
        <div className="flex flex-col md:flex-row md:justify-between items-center mb-2 md:mb-6 print:hidden">
          <h1 className="text-3xl md:text-2xl mb-2 md:mb-0 font-semibold text-indigo-700">
            RFC Management Hub
            {teamName && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                / {teamName}
              </span>
            )}
          </h1>
          <AuthButtons user={user} />
        </div>
        {children}
      </div>
    </div>
  );
}
