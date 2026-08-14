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
import ImageField from "@/components/admin/ImageField";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { FocalPoint } from "@/components/admin/FocalPointEditor";
import { useToast, useUnsavedWarning } from "@/lib/admin/toast";
import { deleteTeamMember, reorderTeam, saveTeamMember } from "./actions";

export interface TeamMemberRow {
  id: string;
  sort_order: number;
  name: string;
  role_de: string | null;
  role_en: string | null;
  role_fr: string | null;
  extra_de: string | null;
  extra_en: string | null;
  extra_fr: string | null;
  photo_path: string | null;
  focal_x: number;
  focal_y: number;
  zoom: number;
  visible: boolean;
}

const LOCALES = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
] as const;
type Loc = (typeof LOCALES)[number]["code"];

export default function TeamEditor({ initialMembers }: { initialMembers: TeamMemberRow[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [language, setLanguage] = useState<Loc>("de");
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [pendingReorder, startReorder] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<TeamMemberRow | null>(null);
  const toast = useToast();

  useUnsavedWarning(dirtyIds.size > 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const patch = (id: string, changes: Partial<TeamMemberRow>) => {
    setMembers((current) => current.map((m) => (m.id === id ? { ...m, ...changes } : m)));
    setDirtyIds((current) => new Set(current).add(id));
  };

  const saveOne = async (row: TeamMemberRow) => {
    setPendingIds((current) => new Set(current).add(row.id));
    const result = await saveTeamMember({
      id: row.id.startsWith("new-") ? undefined : row.id,
      name: row.name,
      role_de: row.role_de,
      role_en: row.role_en,
      role_fr: row.role_fr,
      extra_de: row.extra_de,
      extra_en: row.extra_en,
      extra_fr: row.extra_fr,
      photo_path: row.photo_path,
      focal_x: row.focal_x,
      focal_y: row.focal_y,
      zoom: row.zoom,
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
    // Replace the placeholder id if this was a new row.
    if (result.id && row.id !== result.id) {
      setMembers((current) => current.map((m) => (m.id === row.id ? { ...m, id: result.id! } : m)));
    }
    setDirtyIds((current) => {
      const next = new Set(current);
      next.delete(row.id);
      if (result.id && row.id !== result.id) next.delete(result.id);
      return next;
    });
    toast.success("Gespeichert.");
  };

  const removeMember = async (row: TeamMemberRow) => {
    setConfirmDelete(null);
    if (row.id.startsWith("new-")) {
      setMembers((current) => current.filter((m) => m.id !== row.id));
      return;
    }
    const result = await deleteTeamMember(row.id);
    if (!result.ok) {
      toast.error(result.error ?? "Löschen fehlgeschlagen.");
      return;
    }
    setMembers((current) => current.filter((m) => m.id !== row.id));
    toast.success(`„${row.name}" gelöscht.`);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = members.findIndex((m) => m.id === active.id);
    const newIndex = members.findIndex((m) => m.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(members, oldIndex, newIndex);
    setMembers(next);
    // Persist immediately — a drop is an explicit save, no "unsaved" state.
    startReorder(async () => {
      const persistedIds = next.filter((m) => !m.id.startsWith("new-")).map((m) => m.id);
      const result = await reorderTeam(persistedIds);
      if (!result.ok) toast.error(result.error ?? "Neue Reihenfolge fehlgeschlagen.");
    });
  };

  const addMember = () => {
    const id = `new-${Date.now().toString(36)}`;
    setMembers((current) => [
      ...current,
      {
        id,
        sort_order: current.length + 1,
        name: "",
        role_de: null,
        role_en: null,
        role_fr: null,
        extra_de: null,
        extra_en: null,
        extra_fr: null,
        photo_path: null,
        focal_x: 50,
        focal_y: 50,
        zoom: 1,
        visible: true,
      },
    ]);
    setDirtyIds((current) => new Set(current).add(id));
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-11)" }}>
        <div>
          <p className="a-label">Team</p>
          <h1 className="a-page-title">Trainer-Karten</h1>
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
        Ziehe die Karten am Griff, um die Reihenfolge zu ändern. Ausgeblendete Karten sind auf
        der Website nicht sichtbar. Änderungen werden pro Karte gespeichert.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={members.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          <div style={{ marginTop: "var(--space-15)" }}>
            {members.map((member) => (
              <TeamRow
                key={member.id}
                member={member}
                language={language}
                dirty={dirtyIds.has(member.id)}
                pending={pendingIds.has(member.id)}
                onPatch={(changes) => patch(member.id, changes)}
                onSave={() => void saveOne(member)}
                onDelete={() => setConfirmDelete(member)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div style={{ marginTop: "var(--space-15)", display: "flex", gap: "var(--space-9)", flexWrap: "wrap" }}>
        <button type="button" className="a-btn" onClick={addMember}>
          + Neue Trainer-Karte
        </button>
        {pendingReorder ? <span className="a-savebar-state">Reihenfolge wird gespeichert …</span> : null}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Trainer-Karte löschen?"
        question={
          confirmDelete ? (
            <>
              Möchtest du die Karte für <strong>{confirmDelete.name || "diese Person"}</strong>{" "}
              wirklich löschen? Das Foto bleibt im Speicher, kann aber später über die
              Datei-Verwaltung entfernt werden.
            </>
          ) : (
            ""
          )
        }
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && void removeMember(confirmDelete)}
      />
    </>
  );
}

interface RowProps {
  member: TeamMemberRow;
  language: Loc;
  dirty: boolean;
  pending: boolean;
  onPatch: (changes: Partial<TeamMemberRow>) => void;
  onSave: () => void;
  onDelete: () => void;
}

function TeamRow({ member, language, dirty, pending, onPatch, onSave, onDelete }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: member.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const roleField = `role_${language}` as const;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`a-row ${isDragging ? "a-row-dragging" : ""} ${member.visible ? "" : "a-row-hidden"}`}
    >
      <button
        type="button"
        className="a-grip"
        aria-label={`„${member.name || "Karte"}" verschieben`}
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>

      <div className="a-row-body">
        <div className="a-field">
          <label className="a-field-label">Name</label>
          <input
            className="a-input"
            value={member.name}
            onChange={(e) => onPatch({ name: e.target.value })}
            maxLength={80}
          />
        </div>

        <ImageField
          fieldKey={`team.${member.id}`}
          label="Foto"
          value={member.photo_path}
          onChange={(next) => onPatch({ photo_path: next })}
          focal={{ focalX: member.focal_x, focalY: member.focal_y, zoom: member.zoom }}
          onFocalChange={(next: FocalPoint) =>
            onPatch({ focal_x: next.focalX, focal_y: next.focalY, zoom: next.zoom })
          }
          aspectRatio="1 / 1"
        />

        <div className="a-field">
          <label className="a-field-label">
            Rolle <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>· {language.toUpperCase()}</span>
          </label>
          <input
            className="a-input"
            value={member[roleField] ?? ""}
            onChange={(e) => onPatch({ [roleField]: e.target.value || null } as Partial<TeamMemberRow>)}
            maxLength={80}
          />
          {language !== "de" && !(member[roleField] ?? "").trim() ? (
            <p className="a-field-help">Leer — fällt auf Deutsch zurück.</p>
          ) : null}
        </div>

        <div className="a-row-actions">
          <label style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-4)" }}>
            <input
              type="checkbox"
              checked={member.visible}
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
              disabled={!dirty || pending || !member.name.trim()}
            >
              {pending ? "Speichern …" : dirty ? "Speichern" : "Gespeichert"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
