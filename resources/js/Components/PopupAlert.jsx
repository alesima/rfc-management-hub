import React, { useState, useEffect } from "react";

const PopupAlert = ({ message, onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration]);

  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(onClose, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div
        className={`transform transition-all duration-500 ease-in-out bg-white rounded-lg shadow-lg p-6 max-w-xs text-center ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        <p className="text-gray-800 font-semibold mb-4">{message}</p>
        <button
          onClick={() => setIsVisible(false)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default PopupAlert;
