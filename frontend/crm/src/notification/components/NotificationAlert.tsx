import { X } from "lucide-react";
import React from "react";
import toast, { Toast } from "react-hot-toast";

function NotificationAlert({ t }: { t: Toast }) {
  return (
    <div
      className={`${
        t.visible ? "animate-slide-in-right" : "animate-slide-out-right"
      } max-w-sm w-full bg-white shadow-sm rounded pointer-events-auto flex border-0  transition-all duration-300`}
    >
      {/* Left side (icon + text) */}
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start gap-3">
          {/* Icon or avatar */}
          {/* <div className="flex-shrink-0">
            <img
              className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-100"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80"
              alt="Profile"
            />
          </div> */}

          {/* Message */}
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-gray-900">Emilia Gates</p>
            <p className="mt-0.5 text-sm text-gray-600">
              Sure! 8:30pm works great! 🎉
            </p>
          </div>
        </div>
      </div>

      {/* Close button */}
      <div className="flex items-center border-l-0 border-gray-100">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="p-4 text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors duration-200 focus:outline-none"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default NotificationAlert;
