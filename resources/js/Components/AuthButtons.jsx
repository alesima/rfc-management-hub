import React from "react";
import { Link, useForm } from "@inertiajs/react";

export default function userButtons({ user }) {
  const { post } = useForm();

  const handleLogout = (e) => {
    e.preventDefault();
    post(route("logout"));
  };

  if (user) {
    return (
      <div className="flex items-center w-full md:w-auto justify-end">
        <span className="mr-4 text-gray-600">Hi, {user.name}</span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 w-full md:w-auto">
      <Link
        href={route("login")}
        className="w-full md:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 text-center"
      >
        Login
      </Link>
      <Link
        href={route("register")}
        className="w-full md:w-auto px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 text-center"
      >
        Register
      </Link>
    </div>
  );
}
