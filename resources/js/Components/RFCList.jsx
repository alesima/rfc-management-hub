import React from "react";
import { Link } from "@inertiajs/react";
import { handleDaysAgo } from "@/Utils/DateUtils";

export default function RFCList({ rfcs, onRFCSelect }) {
  return (
    <div className="space-y-4">
      {rfcs.map((rfc) => (
        <div
          key={rfc.id}
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium text-gray-800">{rfc.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Submitted by {rfc.username} • {handleDaysAgo(rfc.created_at)}
          </p>
          {rfc.tags && rfc.tags.length > 0 && (
            <div className="flex flex-wrap mt-2">
              {rfc.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-indigo-100 text-indigo-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-gray-700 mt-2">
            {rfc.content.substring(0, 150)}...
          </p>
          <Link
            href={route("rfcs.show", rfc.id)}
            onClick={(e) => {
              e.preventDefault();
              onRFCSelect(rfc);
            }}
            className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block transition-colors duration-200"
          >
            Read more
          </Link>
        </div>
      ))}
    </div>
  );
}
