import React from "react";

interface PasswordToggleProps {
  visible: boolean;
  onToggle: () => void;
  className?: string;
}

export const PasswordToggle: React.FC<PasswordToggleProps> = ({
  visible,
  onToggle,
  className = "",
}) => (
  <button
    type="button"
    onClick={onToggle}
    className={`absolute right-3 top-12 -translate-y-1/2 text-gray-500 hover:text-gray-700 ${className}`}
  >
    {visible ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.458 12C3.732 7.943 7.523 5 12 5
             c4.478 0 8.268 2.943 9.542 7
             -1.274 4.057-5.064 7-9.542 7
             -4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.875 18.825A10.05 10.05 0 0112 19
             c-4.478 0-8.268-2.943-9.542-7
             a9.957 9.957 0 013.574-4.568M9.88 9.88
             A3 3 0 0114.12 14.12M6.1 6.1l11.8 11.8"
        />
      </svg>
    )}
  </button>
);
