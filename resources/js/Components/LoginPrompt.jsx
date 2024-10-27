import React from "react";
import { Link } from "@inertiajs/react";

export default function LoginPrompt({ title, message }) {
  return (
    <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 text-center">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <Link
        href={route("login")}
        className="inline-block px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
      >
        Log In
      </Link>
    </div>
  );
}
