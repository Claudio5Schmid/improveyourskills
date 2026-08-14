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
import { FACT_ICON_KEYS, FACT_ICONS, isFactIconKey } from "@/lib/facts-icons";
import { deleteFact, reorderFacts, saveFact } from "./actions";

export interface FactRow {
  id: string;
  sort_order: number;
  icon: string;
  label_de: string;
  label_en: string | null;
  label_fr: string | null;
  status: "set" | "open" | "soon";
  value_de: string | null;
  value_en: string | null;
  value_fr: string | null;
  visible: boolean;
}

const LOCALES = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
] as const;
type Loc = (typeof LOCALES)[number]["code"];

const STATUS_OPTIONS = [
  { value: "set", label: "Datum/Wert steht fest" },
  { value: "open", label: "Datum noch offen" },
  { value: "soon", label: "Kommt bald / Infos folgen" },
] as const;

export default function EckdatenEditor({ initial }: { initial: FactRow[] }) {
  const [rows, setRows] = useState(initial);
  const [language, setLanguage] = useState<Loc>("de");
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [pendingReorder, startReorder] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<FactRow | null>(null);
  const toast = useToast();
  useUnsavedWarning(dirtyIds.size > 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const patch = (id: string, changes: Partial<FactRow>) => {
    setRows((current) => current.map((r) => (r.id === id ? { ...r, ...changes } : r)));
    setDirtyIds((current) => new Set(current).add(id));
  };

  const saveOne = async (row: FactRow) => {
    setPendingIds((current) => new Set(current).add(row.id));
    const result = await saveFact({
      id: row.id.startsWith("new-") ? undefined : row.id,
      icon: row.icon,
      label_de: row.label_de,
      label_en: row.label_en,
      label_fr: row.label_fr,
      status: row.status,
      value_de: row.value_de,
      value_en: row.value_en,
      value_fr: row.value_fr,
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

  const removeRow = async (row: FactRow) => {
    setConfirmDelete(null);
    if (row.id.startsWith("new-")) {
      setRows((current) => current.filter((r) => r.id !== row.id));
      return;
    }
    const result = await deleteFact(row.id);
    if (!result.ok) return toast.error(result.error ?? "Löschen fehlgeschlagen.");
    setRows((current) => current.filter((r) => r.id !== row.id));
    toast.success("Eckdatum gelöscht.");
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
      const result = await reorderFacts(ids);
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
        icon: "calendar",
        label_de: "",
        label_en: null,
        label_fr: null,
        status: "set",
        value_de: null,
        value_en: null,
        value_fr: null,
        visible: true,
      },
    ]);
    setDirtyIds((current) => new Set(current).add(id));
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-11)" }}>
        <div>
          <p className="a-label">Startseite</p>
          <h1 className="a-page-title">Eckdaten</h1>
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
        Diese Karten erscheinen direkt unter dem Hero auf der Startseite — Titel und
        Beschreibung darüber bearbeitest du unter <em>Inhalte → Startseite → Eckdaten</em>.
        Der Abschnitt bleibt komplett unsichtbar, solange keine Karte sichtbar ist.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          <div style={{ marginTop: "var(--space-15)" }}>
            {rows.map((row) => (
              <FactRowEditor
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
          </div>
        </SortableContext>
      </DndContext>

      <div style={{ marginTop: "var(--space-15)", display: "flex", gap: "var(--space-9)", flexWrap: "wrap" }}>
        <button type="button" className="a-btn" onClick={addRow}>
          + Neues Eckdatum
        </button>
        {pendingReorder ? <span className="a-savebar-state">Reihenfolge wird gespeichert …</span> : null}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Eckdatum löschen?"
        question={
          confirmDelete ? (
            <>
              Möchtest du <strong>{confirmDelete.label_de || "dieses Eckdatum"}</strong> wirklich
              löschen?
            </>
          ) : (
            ""
          )
        }
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && void removeRow(confirmDelete)}
      />
    </>
  );
}

function FactRowEditor({
  row,
  language,
  dirty,
  pending,
  onPatch,
  onSave,
  onDelete,
}: {
  row: FactRow;
  language: Loc;
  dirty: boolean;
  pending: boolean;
  onPatch: (changes: Partial<FactRow>) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  const labelField = `label_${language}` as const;
  const valueField = `value_${language}` as const;
  const ActiveIcon = FACT_ICONS[isFactIconKey(row.icon) ? row.icon : "info"].Icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`a-row ${isDragging ? "a-row-dragging" : ""} ${row.visible ? "" : "a-row-hidden"}`}
    >
      <button type="button" className="a-grip" aria-label="Eckdatum verschieben" {...attributes} {...listeners}>
        ⋮⋮
      </button>
      <div className="a-row-body">
        <div className="a-field">
          <label className="a-field-label">Icon</label>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-8)" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "var(--radius-round)",
                background: "var(--color-green-a07)",
                color: "var(--color-green-dark)",
                flexShrink: 0,
              }}
            >
              <ActiveIcon size={18} strokeWidth={1.75} />
            </span>
            <select
              className="a-select"
              value={row.icon}
              onChange={(e) => onPatch({ icon: e.target.value })}
            >
              {FACT_ICON_KEYS.map((key) => (
                <option key={key} value={key}>
                  {FACT_ICONS[key].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="a-field">
          <label className="a-field-label">
            Label <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>· {language.toUpperCase()}</span>
          </label>
          <input
            className="a-input"
            value={row[labelField] ?? ""}
            onChange={(e) => onPatch({ [labelField]: e.target.value || (language === "de" ? "" : null) } as Partial<FactRow>)}
            maxLength={40}
            placeholder="z. B. Nächster Termin"
          />
        </div>

        <div className="a-field">
          <label className="a-field-label">Status</label>
          <select
            className="a-select"
            value={row.status}
            onChange={(e) => onPatch({ status: e.target.value as FactRow["status"] })}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {row.status === "set" ? (
          <div className="a-field">
            <label className="a-field-label">
              Wert <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>· {language.toUpperCase()}</span>
            </label>
            <p className="a-field-help">Zum Beispiel „Sa, 14. März 2027“, „Sportanlage Buchholz“ oder „CHF 48.–“.</p>
            <input
              className="a-input"
              value={row[valueField] ?? ""}
              onChange={(e) => onPatch({ [valueField]: e.target.value || null } as Partial<FactRow>)}
              maxLength={60}
            />
          </div>
        ) : (
          <p className="a-field-help">
            Solange dieser Status aktiv ist, zeigt die Website automatisch den passenden
            Hinweistext statt eines Werts (editierbar unter Inhalte → Startseite → Eckdaten).
          </p>
        )}

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
            <button
              type="button"
              className="a-btn a-btn-sm a-btn-primary"
              onClick={onSave}
              disabled={!dirty || pending || !row.label_de.trim()}
            >
              {pending ? "Speichern …" : dirty ? "Speichern" : "Gespeichert"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
