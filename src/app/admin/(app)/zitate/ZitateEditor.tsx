"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast, useUnsavedWarning } from "@/lib/admin/toast";
import {
  deleteStat,
  deleteTestimonial,
  reorderStats,
  reorderTestimonials,
  saveStat,
  saveTestimonial,
} from "./actions";

export interface TestimonialRow {
  id: string;
  sort_order: number;
  quote_de: string | null;
  quote_en: string | null;
  quote_fr: string | null;
  author_name: string | null;
  author_role_de: string | null;
  author_role_en: string | null;
  author_role_fr: string | null;
  visible: boolean;
}

export interface StatRow {
  id: string;
  sort_order: number;
  value: string;
  label_de: string | null;
  label_en: string | null;
  label_fr: string | null;
  visible: boolean;
}

const LOCALES = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
] as const;
type Loc = (typeof LOCALES)[number]["code"];

export default function ZitateEditor({
  initialTestimonials,
  initialStats,
}: {
  initialTestimonials: TestimonialRow[];
  initialStats: StatRow[];
}) {
  const [language, setLanguage] = useState<Loc>("de");

  return (
    <>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-11)" }}>
        <div>
          <p className="a-label">Über uns</p>
          <h1 className="a-page-title">Zitate & Zahlen</h1>
        </div>
        <div className="a-tabs" role="tablist" aria-label="Sprache">
          {LOCALES.map((loc) => (
            <button
              key={loc.code}
              type="button"
              role="tab"
              className="a-tab"
              aria-selected={language === loc.code}
              onClick={() => setLanguage(loc.code)}
            >
              {loc.label}
            </button>
          ))}
        </div>
      </div>
      <p className="a-page-lead">
        Zitate zeigen wir als Rotation, Zahlen als Band in „Über uns“. Beide erscheinen erst,
        wenn die entsprechende Sektion auf der Seite eingebaut ist (Phase 6).
      </p>

      <TestimonialsCard initial={initialTestimonials} language={language} />
      <StatsCard initial={initialStats} language={language} />
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Testimonials
// ══════════════════════════════════════════════════════════════════════════

function TestimonialsCard({ initial, language }: { initial: TestimonialRow[]; language: Loc }) {
  const [rows, setRows] = useState(initial);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [pendingReorder, startReorder] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<TestimonialRow | null>(null);
  const toast = useToast();
  useUnsavedWarning(dirtyIds.size > 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const patch = (id: string, changes: Partial<TestimonialRow>) => {
    setRows((current) => current.map((r) => (r.id === id ? { ...r, ...changes } : r)));
    setDirtyIds((current) => new Set(current).add(id));
  };

  const saveOne = async (row: TestimonialRow) => {
    setPendingIds((current) => new Set(current).add(row.id));
    const result = await saveTestimonial({
      id: row.id.startsWith("new-") ? undefined : row.id,
      quote_de: row.quote_de,
      quote_en: row.quote_en,
      quote_fr: row.quote_fr,
      author_name: row.author_name,
      author_role_de: row.author_role_de,
      author_role_en: row.author_role_en,
      author_role_fr: row.author_role_fr,
      visible: row.visible,
    });
    setPendingIds((current) => {
      const next = new Set(current);
      next.delete(row.id);
      return next;
    });
    if (!result.ok) {
      toast.error(result.error ?? "Speichern fehlgeschlagen.");
      return;
    }
    if (result.id && row.id !== result.id) {
      setRows((current) => current.map((r) => (r.id === row.id ? { ...r, id: result.id! } : r)));
    }
    setDirtyIds((current) => {
      const next = new Set(current);
      next.delete(row.id);
      if (result.id) next.delete(result.id);
      return next;
    });
    toast.success("Gespeichert.");
  };

  const removeRow = async (row: TestimonialRow) => {
    setConfirmDelete(null);
    if (row.id.startsWith("new-")) {
      setRows((current) => current.filter((r) => r.id !== row.id));
      return;
    }
    const result = await deleteTestimonial(row.id);
    if (!result.ok) return toast.error(result.error ?? "Löschen fehlgeschlagen.");
    setRows((current) => current.filter((r) => r.id !== row.id));
    toast.success("Zitat gelöscht.");
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex((r) => r.id === active.id);
    const newIndex = rows.findIndex((r) => r.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(rows, oldIndex, newIndex);
    setRows(next);
    startReorder(async () => {
      const ids = next.filter((r) => !r.id.startsWith("new-")).map((r) => r.id);
      const result = await reorderTestimonials(ids);
      if (!result.ok) toast.error(result.error ?? "Neue Reihenfolge fehlgeschlagen.");
    });
  };

  const addRow = () => {
    const id = `new-${Date.now().toString(36)}`;
    setRows((current) => [
      ...current,
      {
        id,
        sort_order: current.length + 1,
        quote_de: null,
        quote_en: null,
        quote_fr: null,
        author_name: null,
        author_role_de: null,
        author_role_en: null,
        author_role_fr: null,
        visible: true,
      },
    ]);
    setDirtyIds((current) => new Set(current).add(id));
  };

  return (
    <div className="a-card">
      <div className="a-card-head">
        <h2 className="a-card-title">Zitate</h2>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          {rows.map((row) => (
            <TestimonialRowEditor
              key={row.id}
              row={row}
              language={language}
              dirty={dirtyIds.has(row.id)}
              pending={pendingIds.has(row.id)}
              onPatch={(changes) => patch(row.id, changes)}
              onSave={() => void saveOne(row)}
              onDelete={() => setConfirmDelete(row)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div style={{ marginTop: "var(--space-11)", display: "flex", gap: "var(--space-9)", flexWrap: "wrap" }}>
        <button type="button" className="a-btn" onClick={addRow}>
          + Neues Zitat
        </button>
        {pendingReorder ? <span className="a-savebar-state">Reihenfolge wird gespeichert …</span> : null}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Zitat löschen?"
        question={
          confirmDelete ? (
            <>
              Möchtest du das Zitat von{" "}
              <strong>{confirmDelete.author_name || "unbekannter Person"}</strong> wirklich
              löschen?
            </>
          ) : (
            ""
          )
        }
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && void removeRow(confirmDelete)}
      />
    </div>
  );
}

function TestimonialRowEditor({
  row,
  language,
  dirty,
  pending,
  onPatch,
  onSave,
  onDelete,
}: {
  row: TestimonialRow;
  language: Loc;
  dirty: boolean;
  pending: boolean;
  onPatch: (changes: Partial<TestimonialRow>) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  const quoteField = `quote_${language}` as const;
  const roleField = `author_role_${language}` as const;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`a-row ${isDragging ? "a-row-dragging" : ""} ${row.visible ? "" : "a-row-hidden"}`}
    >
      <button type="button" className="a-grip" aria-label="Zitat verschieben" {...attributes} {...listeners}>
        ⋮⋮
      </button>
      <div className="a-row-body">
        <div className="a-field">
          <label className="a-field-label">
            Zitat <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>· {language.toUpperCase()}</span>
          </label>
          <textarea
            className="a-textarea"
            value={row[quoteField] ?? ""}
            onChange={(e) => onPatch({ [quoteField]: e.target.value || null } as Partial<TestimonialRow>)}
            rows={3}
            maxLength={500}
          />
        </div>
        <div className="a-field">
          <label className="a-field-label">Autor:in (Name)</label>
          <input
            className="a-input"
            value={row.author_name ?? ""}
            onChange={(e) => onPatch({ author_name: e.target.value || null })}
            maxLength={80}
          />
        </div>
        <div className="a-field">
          <label className="a-field-label">
            Autor:in (Rolle) <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>· {language.toUpperCase()}</span>
          </label>
          <input
            className="a-input"
            value={row[roleField] ?? ""}
            onChange={(e) => onPatch({ [roleField]: e.target.value || null } as Partial<TestimonialRow>)}
            maxLength={80}
          />
        </div>

        <div className="a-row-actions">
          <label style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-4)" }}>
            <input
              type="checkbox"
              checked={row.visible}
              onChange={(e) => onPatch({ visible: e.target.checked })}
            />
            Sichtbar auf der Website
          </label>
          <span style={{ marginLeft: "auto", display: "inline-flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
            <button type="button" className="a-btn a-btn-sm a-btn-danger" onClick={onDelete}>
              Löschen
            </button>
            <button type="button" className="a-btn a-btn-sm a-btn-primary" onClick={onSave} disabled={!dirty || pending}>
              {pending ? "Speichern …" : dirty ? "Speichern" : "Gespeichert"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Stats
// ══════════════════════════════════════════════════════════════════════════

function StatsCard({ initial, language }: { initial: StatRow[]; language: Loc }) {
  const [rows, setRows] = useState(initial);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [pendingReorder, startReorder] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<StatRow | null>(null);
  const toast = useToast();
  useUnsavedWarning(dirtyIds.size > 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const patch = (id: string, changes: Partial<StatRow>) => {
    setRows((current) => current.map((r) => (r.id === id ? { ...r, ...changes } : r)));
    setDirtyIds((current) => new Set(current).add(id));
  };

  const saveOne = async (row: StatRow) => {
    setPendingIds((current) => new Set(current).add(row.id));
    const result = await saveStat({
      id: row.id.startsWith("new-") ? undefined : row.id,
      value: row.value,
      label_de: row.label_de,
      label_en: row.label_en,
      label_fr: row.label_fr,
      visible: row.visible,
    });
    setPendingIds((current) => {
      const next = new Set(current);
      next.delete(row.id);
      return next;
    });
    if (!result.ok) return toast.error(result.error ?? "Speichern fehlgeschlagen.");
    if (result.id && row.id !== result.id) {
      setRows((current) => current.map((r) => (r.id === row.id ? { ...r, id: result.id! } : r)));
    }
    setDirtyIds((current) => {
      const next = new Set(current);
      next.delete(row.id);
      if (result.id) next.delete(result.id);
      return next;
    });
    toast.success("Gespeichert.");
  };

  const removeRow = async (row: StatRow) => {
    setConfirmDelete(null);
    if (row.id.startsWith("new-")) {
      setRows((current) => current.filter((r) => r.id !== row.id));
      return;
    }
    const result = await deleteStat(row.id);
    if (!result.ok) return toast.error(result.error ?? "Löschen fehlgeschlagen.");
    setRows((current) => current.filter((r) => r.id !== row.id));
    toast.success("Zahl gelöscht.");
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex((r) => r.id === active.id);
    const newIndex = rows.findIndex((r) => r.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(rows, oldIndex, newIndex);
    setRows(next);
    startReorder(async () => {
      const ids = next.filter((r) => !r.id.startsWith("new-")).map((r) => r.id);
      const result = await reorderStats(ids);
      if (!result.ok) toast.error(result.error ?? "Neue Reihenfolge fehlgeschlagen.");
    });
  };

  const addRow = () => {
    const id = `new-${Date.now().toString(36)}`;
    setRows((current) => [
      ...current,
      {
        id,
        sort_order: current.length + 1,
        value: "",
        label_de: null,
        label_en: null,
        label_fr: null,
        visible: true,
      },
    ]);
    setDirtyIds((current) => new Set(current).add(id));
  };

  return (
    <div className="a-card">
      <div className="a-card-head">
        <h2 className="a-card-title">Zahlen</h2>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          {rows.map((row) => (
            <StatRowEditor
              key={row.id}
              row={row}
              language={language}
              dirty={dirtyIds.has(row.id)}
              pending={pendingIds.has(row.id)}
              onPatch={(changes) => patch(row.id, changes)}
              onSave={() => void saveOne(row)}
              onDelete={() => setConfirmDelete(row)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div style={{ marginTop: "var(--space-11)", display: "flex", gap: "var(--space-9)", flexWrap: "wrap" }}>
        <button type="button" className="a-btn" onClick={addRow}>
          + Neue Zahl
        </button>
        {pendingReorder ? <span className="a-savebar-state">Reihenfolge wird gespeichert …</span> : null}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Zahl löschen?"
        question={
          confirmDelete ? (
            <>
              Möchtest du die Zahl <strong>„{confirmDelete.value || "—"}“</strong> wirklich löschen?
            </>
          ) : (
            ""
          )
        }
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && void removeRow(confirmDelete)}
      />
    </div>
  );
}

function StatRowEditor({
  row,
  language,
  dirty,
  pending,
  onPatch,
  onSave,
  onDelete,
}: {
  row: StatRow;
  language: Loc;
  dirty: boolean;
  pending: boolean;
  onPatch: (changes: Partial<StatRow>) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  const labelField = `label_${language}` as const;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`a-row ${isDragging ? "a-row-dragging" : ""} ${row.visible ? "" : "a-row-hidden"}`}
    >
      <button type="button" className="a-grip" aria-label="Zahl verschieben" {...attributes} {...listeners}>
        ⋮⋮
      </button>
      <div className="a-row-body">
        <div className="a-field">
          <label className="a-field-label">Wert</label>
          <p className="a-field-help">Zum Beispiel „30“, „100 %“ oder „3 h“.</p>
          <input
            className="a-input"
            value={row.value}
            onChange={(e) => onPatch({ value: e.target.value })}
            maxLength={20}
          />
        </div>
        <div className="a-field">
          <label className="a-field-label">
            Beschriftung <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>· {language.toUpperCase()}</span>
          </label>
          <input
            className="a-input"
            value={row[labelField] ?? ""}
            onChange={(e) => onPatch({ [labelField]: e.target.value || null } as Partial<StatRow>)}
            maxLength={60}
          />
        </div>
        <div className="a-row-actions">
          <label style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-4)" }}>
            <input
              type="checkbox"
              checked={row.visible}
              onChange={(e) => onPatch({ visible: e.target.checked })}
            />
            Sichtbar auf der Website
          </label>
          <span style={{ marginLeft: "auto", display: "inline-flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
            <button type="button" className="a-btn a-btn-sm a-btn-danger" onClick={onDelete}>
              Löschen
            </button>
            <button type="button" className="a-btn a-btn-sm a-btn-primary" onClick={onSave} disabled={!dirty || pending || !row.value.trim()}>
              {pending ? "Speichern …" : dirty ? "Speichern" : "Gespeichert"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
