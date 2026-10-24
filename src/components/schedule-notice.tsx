"use client";

import { useEffect, useRef } from "react";

export function ScheduleNotice() {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    return () => element?.close();
  }, []);

  return (
    <>
      <p className="schedule-empty" role="status">
        No schedule announced yet. Please check back soon.
      </p>

      <dialog
        ref={dialog}
        className="schedule-notice"
        aria-labelledby="schedule-title"
        aria-describedby="schedule-description"
      >
        <h2 id="schedule-title">No schedule announced yet</h2>
        <p id="schedule-description">Please check back soon.</p>
        <form method="dialog">
          <button className="button" autoFocus>
            Got it
          </button>
        </form>
      </dialog>
    </>
  );
}