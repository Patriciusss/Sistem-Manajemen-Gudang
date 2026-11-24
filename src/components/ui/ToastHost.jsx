"use client";

import { useEffect, useState } from "react";

export default function ToastHost() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    let timer;
    const show = (e) => {
      setMessage(e.detail);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(""), 3500);
    };
    window.addEventListener("toast", show);
    return () => {
      window.removeEventListener("toast", show);
      clearTimeout(timer);
    };
  }, []);

  if (!message) return null;
  return (
    <div key={message} role="status" className="toast fixed right-4 bottom-4 z-60 max-w-xs rounded-xl border border-white/80 bg-white/95 px-4 py-3 text-sm font-semibold text-ink shadow-lg shadow-brand/25">
      {message}
    </div>
  );
}
