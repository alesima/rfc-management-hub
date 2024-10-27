import React from "react";
import { useForm } from "@inertiajs/react";

const CommentSubmitForm = ({ rfc, onSubmit }) => {
  const { data, setData, post, reset, processing, errors } = useForm({
    content: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("comments.store", rfc.id), {
      preserveScroll: true,
      onSuccess: () => {
        onSubmit(data.content);
        reset("content");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Leave a Comment
      </h2>
      <textarea
        value={data.content}
        onChange={(e) => setData("content", e.target.value)}
        placeholder="Write your comment..."
        className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
        rows="4"
      />
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        disabled={processing || !data.content.trim()}
      >
        {processing ? "Submitting..." : "Submit Comment"}
      </button>

      {errors.content && (
        <p className="text-red-500 text-sm mt-2">{errors.content}</p>
      )}
    </form>
  );
};

export default CommentSubmitForm;
