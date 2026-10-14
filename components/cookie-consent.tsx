"use client";

import { useEffect, useState } from "react";

const KEY = "cc-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const choose = (value: string) => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("cc-consent"));
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl border border-black bg-white p-4 shadow-xl sm:left-auto sm:right-6"
    >
      <p className="text-sm font-bold">Cookies, your call</p>
      <p className="mt-1 text-sm text-neutral-700">
        We use strictly necessary cookies for the cart and checkout. Optional analytics cookies only if you accept.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => choose("accepted")}
          className="btn-signal rounded-full px-4 py-2 text-sm"
        >
          Accept
        </button>
        <button
          onClick={() => choose("rejected")}
          className="rounded-full border border-black px-4 py-2 text-sm font-semibold"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
