import React from "react";

export default function Loader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-6 h-6 border-3 border-white  border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
