"use client";

import { usePathname } from "next/navigation";

export default function BackButton() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <div className="px-6 pt-4">
      <button
        onClick={() => window.history.back()}
        className="w-auto border-0 bg-transparent p-0 font-medium text-gray-700 hover:text-black"
      >
        ← Back
      </button>
    </div>
  );
}