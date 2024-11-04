import React from "react";
import { Head } from "@inertiajs/react";
import AuthButtons from "@/Components/AuthButtons";

export default function AppLayout({ children, title, user }) {
  return (
    <div className="min-h-screen bg-purple-50 md:p-8">
      <Head title={title} />
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm md:p-6 p-2">
        <div className="flex flex-col md:flex-row md:justify-between items-center mb-2 md:mb-6">
          <h1 className="text-3xl md:text-2xl mb-2 md:mb-0 font-semibold text-indigo-700">
            RFC Management Hub
          </h1>
          <AuthButtons user={user} />
        </div>
        {children}
      </div>
    </div>
  );
}
