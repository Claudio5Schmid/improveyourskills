"use client";

import { useEffect, useRef } from "react";

interface Props {
  open: boolean;
  title: string;
  /** Reads like a sentence naming the exact item, per the brief. */
  question: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

/**
 * Modal confirmation dialog. Uses the native <dialog> element (accessible by
 * default, closes on Esc, has a backdrop). The question is a React node so
 * callers can bold the item name — the brief requires that every destructive
 * dialog name the item explicitly.
 */
export default function ConfirmDialog({
  open,
  title,
  question,
  confirmLabel = "Löschen",
  cancelLabel = "Abbrechen",
  onConfirm,
  onCancel,
  destructive = true,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="a-dialog"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClose={onCancel}
    >
      <h2>{title}</h2>
      <p>{question}</p>
      <div className="a-dialog-actions">
        <button type="button" className="a-btn" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={destructive ? "a-btn a-btn-danger" : "a-btn a-btn-primary"}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
