import React from "react";
import { Head } from "@inertiajs/react";
import AuthButtons from "@/Components/AuthButtons";

export default function AppLayout({ children, title, user }) {
  return (
    <div className="min-h-screen bg-purple-50 p-8">
      <Head title={title} />
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-indigo-700">
            RFC Management Hub
          </h1>
          <AuthButtons user={user} />
        </div>
        {children}
      </div>
    </div>
  );
}
