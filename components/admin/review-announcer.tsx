"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

/**
 * The one place a review decision's result is shown.
 *
 * A decision moves its row out of "Waiting for review" — the server action
 * revalidates the page and the row comes back in the reviewed list — so the
 * button that was clicked no longer exists, and neither does any message
 * rendered beside it. The result is shown here instead, above the list, in a
 * spot that survives the refresh.
 *
 * Focus moves to the message when it appears. Otherwise, with the clicked
 * button gone, focus would fall back to the top of the document and a
 * keyboard user would lose their place in the queue. Focusing it is also what
 * makes a screen reader read it, so it is deliberately not a live region as
 * well — that would read it twice.
 *
 * The page keys this on the active tab, so a message from one tab does not
 * follow the admin to the other.
 */

type Note = { text: string; ok: boolean; seq: number };

const AnnounceContext = createContext<(text: string, ok: boolean) => void>(() => {});

export function useAnnounce() {
  return useContext(AnnounceContext);
}

export function ReviewAnnouncer({ children }: { children: React.ReactNode }) {
  const [note, setNote] = useState<Note | null>(null);
  const ref = useRef<HTMLParagraphElement>(null);

  /* `seq` changes even when the text repeats, so a second identical result
     still moves focus. */
  useEffect(() => {
    if (note) ref.current?.focus();
  }, [note]);

  const announce = (text: string, ok: boolean) =>
    setNote((previous) => ({ text, ok, seq: (previous?.seq ?? 0) + 1 }));

  return (
    <AnnounceContext.Provider value={announce}>
      {note ? (
        <p
          ref={ref}
          tabIndex={-1}
          className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${
            note.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {note.text}
        </p>
      ) : null}
      {children}
    </AnnounceContext.Provider>
  );
}
