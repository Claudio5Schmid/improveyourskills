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
import { deleteCarouselImage, reorderCarousel, saveCarouselImage } from "./actions";

export interface CarouselRow {
  id: string;
  sort_order: number;
  image_path: string | null;
  alt_de: string | null;
  alt_en: string | null;
  alt_fr: string | null;
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

export default function KarussellEditor({ initialImages }: { initialImages: CarouselRow[] }) {
  const [images, setImages] = useState(initialImages);
  const [language, setLanguage] = useState<Loc>("de");
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [pendingReorder, startReorder] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<CarouselRow | null>(null);
  const toast = useToast();

  useUnsavedWarning(dirtyIds.size > 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const patch = (id: string, changes: Partial<CarouselRow>) => {
    setImages((current) => current.map((r) => (r.id === id ? { ...r, ...changes } : r)));
    setDirtyIds((current) => new Set(current).add(id));
  };

  const saveOne = async (row: CarouselRow) => {
    setPendingIds((current) => new Set(current).add(row.id));
    const result = await saveCarouselImage({
      id: row.id.startsWith("new-") ? undefined : row.id,
      image_path: row.image_path,
      alt_de: row.alt_de,
      alt_en: row.alt_en,
      alt_fr: row.alt_fr,
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
    if (result.id && row.id !== result.id) {
      setImages((current) => current.map((r) => (r.id === row.id ? { ...r, id: result.id! } : r)));
    }
    setDirtyIds((current) => {
      const next = new Set(current);
      next.delete(row.id);
      if (result.id) next.delete(result.id);
      return next;
    });
    toast.success("Gespeichert.");
  };

  const removeRow = async (row: CarouselRow) => {
    setConfirmDelete(null);
    if (row.id.startsWith("new-")) {
      setImages((current) => current.filter((r) => r.id !== row.id));
      return;
    }
    const result = await deleteCarouselImage(row.id);
    if (!result.ok) {
      toast.error(result.error ?? "Löschen fehlgeschlagen.");
      return;
    }
    setImages((current) => current.filter((r) => r.id !== row.id));
    toast.success("Bild entfernt.");
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((r) => r.id === active.id);
    const newIndex = images.findIndex((r) => r.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(images, oldIndex, newIndex);
    setImages(next);
    startReorder(async () => {
      const persistedIds = next.filter((r) => !r.id.startsWith("new-")).map((r) => r.id);
      const result = await reorderCarousel(persistedIds);
      if (!result.ok) toast.error(result.error ?? "Neue Reihenfolge fehlgeschlagen.");
    });
  };

  const addImage = () => {
    const id = `new-${Date.now().toString(36)}`;
    setImages((current) => [
      ...current,
      {
        id,
        sort_order: current.length + 1,
        image_path: null,
        alt_de: null,
        alt_en: null,
        alt_fr: null,
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
          <p className="a-label">Über uns</p>
          <h1 className="a-page-title">Karussell</h1>
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
        Bilder, die auf „Über uns“ gross rotieren. Reihenfolge per Ziehen. Alternativtext wird
        vorgelesen und angezeigt, wenn ein Bild nicht lädt.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={images.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          <div style={{ marginTop: "var(--space-15)" }}>
            {images.map((row) => (
              <CarouselRowEditor
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
        <button type="button" className="a-btn" onClick={addImage}>
          + Neues Bild
        </button>
        {pendingReorder ? <span className="a-savebar-state">Reihenfolge wird gespeichert …</span> : null}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Bild aus dem Karussell entfernen?"
        question={
          confirmDelete ? (
            <>
              Dieses Bild wird aus dem Karussell entfernt. Die Datei bleibt im Speicher.
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

interface RowProps {
  row: CarouselRow;
  language: Loc;
  dirty: boolean;
  pending: boolean;
  onPatch: (changes: Partial<CarouselRow>) => void;
  onSave: () => void;
  onDelete: () => void;
}

function CarouselRowEditor({ row, language, dirty, pending, onPatch, onSave, onDelete }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  const altField = `alt_${language}` as const;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`a-row ${isDragging ? "a-row-dragging" : ""} ${row.visible ? "" : "a-row-hidden"}`}
    >
      <button type="button" className="a-grip" aria-label="Bild verschieben" {...attributes} {...listeners}>
        ⋮⋮
      </button>

      <div className="a-row-body">
        <ImageField
          fieldKey={`karussell.${row.id}`}
          label="Bild"
          value={row.image_path}
          onChange={(next) => onPatch({ image_path: next })}
          focal={{ focalX: row.focal_x, focalY: row.focal_y, zoom: row.zoom }}
          onFocalChange={(next: FocalPoint) =>
            onPatch({ focal_x: next.focalX, focal_y: next.focalY, zoom: next.zoom })
          }
          aspectRatio="4 / 3"
        />

        <div className="a-field">
          <label className="a-field-label">
            Alternativtext <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>· {language.toUpperCase()}</span>
          </label>
          <input
            className="a-input"
            value={row[altField] ?? ""}
            onChange={(e) => onPatch({ [altField]: e.target.value || null } as Partial<CarouselRow>)}
            maxLength={140}
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
            <button
              type="button"
              className="a-btn a-btn-sm a-btn-primary"
              onClick={onSave}
              disabled={!dirty || pending}
            >
              {pending ? "Speichern …" : dirty ? "Speichern" : "Gespeichert"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
