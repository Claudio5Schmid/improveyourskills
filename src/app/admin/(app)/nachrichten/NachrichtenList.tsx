"use client";

import { useState } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/lib/admin/toast";
import { setMessageRead, deleteMessage } from "./actions";

export interface ContactMessageRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  message: string;
  locale: string;
  created_at: string;
  read_at: string | null;
  email_delivery_status: "pending" | "sent" | "failed";
}

const dateFormat = new Intl.DateTimeFormat("de-CH", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function NachrichtenList({ initialMessages }: { initialMessages: ContactMessageRow[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ContactMessageRow | null>(null);
  const toast = useToast();

  const patch = (id: string, changes: Partial<ContactMessageRow>) => {
    setMessages((current) => current.map((m) => (m.id === id ? { ...m, ...changes } : m)));
  };

  const toggleExpanded = (row: ContactMessageRow) => {
    const opening = expandedId !== row.id;
    setExpandedId(opening ? row.id : null);
    if (opening && !row.read_at) {
      const now = new Date().toISOString();
      patch(row.id, { read_at: now });
      void setMessageRead(row.id, true).then((result) => {
        if (!result.ok) {
          patch(row.id, { read_at: null });
          toast.error(result.error ?? "Konnte nicht als gelesen markiert werden.");
        }
      });
    }
  };

  const toggleRead = async (row: ContactMessageRow) => {
    const nextRead = !row.read_at;
    const previous = row.read_at;
    patch(row.id, { read_at: nextRead ? new Date().toISOString() : null });
    const result = await setMessageRead(row.id, nextRead);
    if (!result.ok) {
      patch(row.id, { read_at: previous });
      toast.error(result.error ?? "Konnte nicht aktualisiert werden.");
    }
  };

  const remove = async (row: ContactMessageRow) => {
    setConfirmDelete(null);
    const result = await deleteMessage(row.id);
    if (!result.ok) {
      toast.error(result.error ?? "Löschen fehlgeschlagen.");
      return;
    }
    setMessages((current) => current.filter((m) => m.id !== row.id));
    if (expandedId === row.id) setExpandedId(null);
    toast.success("Nachricht gelöscht.");
  };

  if (messages.length === 0) {
    return (
      <div className="a-notice" style={{ marginTop: "var(--space-15)" }}>
        <h2>Noch keine Nachrichten</h2>
        <p>Sobald jemand das Kontaktformular ausfüllt, erscheint die Nachricht hier.</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginTop: "var(--space-15)" }}>
        {messages.map((row) => {
          const unread = !row.read_at;
          const expanded = expandedId === row.id;
          const name = `${row.first_name} ${row.last_name}`;
          return (
            <div key={row.id} className={`a-row ${unread ? "" : "a-row-hidden"}`}>
              <div className="a-row-body">
                <button
                  type="button"
                  onClick={() => toggleExpanded(row)}
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: "var(--space-9)",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontWeight: unread ? "var(--font-weight-bold)" : "var(--font-weight-medium)" }}>
                    {name}
                    <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}> · {row.email}</span>
                  </span>
                  <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-2xs)", whiteSpace: "nowrap" }}>
                    {dateFormat.format(new Date(row.created_at))}
                  </span>
                </button>

                {!expanded && (
                  <p
                    style={{
                      margin: "var(--space-4) 0 0",
                      color: "var(--color-text-muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.message}
                  </p>
                )}

                {row.email_delivery_status === "failed" && (
                  <span className="a-badge a-badge-warn" style={{ marginTop: "var(--space-4)" }}>
                    E-Mail-Versand fehlgeschlagen
                  </span>
                )}

                {expanded && (
                  <>
                    <p style={{ margin: "var(--space-9) 0", whiteSpace: "pre-line" }}>{row.message}</p>
                    <div className="a-row-actions">
                      <span className="a-badge">{row.locale.toUpperCase()}</span>
                      <a
                        href={`mailto:${row.email}?subject=${encodeURIComponent("Re: Deine Anfrage bei Improve your skills")}`}
                        className="a-btn a-btn-sm a-btn-primary"
                      >
                        Antworten
                      </a>
                      <button type="button" className="a-btn a-btn-sm" onClick={() => void toggleRead(row)}>
                        {unread ? "Als gelesen markieren" : "Als ungelesen markieren"}
                      </button>
                      <button
                        type="button"
                        className="a-btn a-btn-sm a-btn-danger"
                        style={{ marginLeft: "auto" }}
                        onClick={() => setConfirmDelete(row)}
                      >
                        Löschen
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Nachricht löschen?"
        question={
          confirmDelete ? (
            <>
              Die Nachricht von <strong>{confirmDelete.first_name} {confirmDelete.last_name}</strong> wird
              endgültig gelöscht.
            </>
          ) : (
            ""
          )
        }
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && void remove(confirmDelete)}
      />
    </>
  );
}
