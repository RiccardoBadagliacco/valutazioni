"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-[#EFEFEF] p-8 max-w-sm w-full text-center">
        <p className="font-semibold text-[#1A1A1A] text-sm">Qualcosa è andato storto</p>
        <p className="text-xs text-[#999] mt-1 mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-[#111] text-white text-sm font-semibold rounded-xl hover:bg-[#333] transition-colors"
        >
          Riprova
        </button>
      </div>
    </div>
  );
}
