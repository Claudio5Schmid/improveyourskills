"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import PositionedImage from "@/components/PositionedImage";
import FocalPointEditor, { DEFAULT_FOCAL, type FocalPoint } from "@/components/admin/FocalPointEditor";
import { useToast } from "@/lib/admin/toast";
import {
  deleteGalleryPhoto,
  reorderGalleryYear,
  setPhotoFocal,
  setPhotoHidden,
  type NewPhotoInput,
} from "./actions";
import UploadPanel from "./UploadPanel";

export interface AdminPhoto {
  id: string;
  year: number;
  sortOrder: number;
  hidden: boolean;
  /** Signed (existing photos) or the public route (freshly uploaded this session). */
  thumbUrl: string | null;
  focalX: number;
  focalY: number;
  zoom: number;
}

export default function GalerieEditor({
  initialPhotos,
  currentEditionYear,
}: {
  initialPhotos: AdminPhoto[];
  currentEditionYear: number;
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const toast = useToast();

  const years = useMemo(() => [...new Set(photos.map((p) => p.year))].sort((a, b) => b - a), [photos]);

  const handleUploaded = (inputs: NewPhotoInput[]) => {
    setPhotos((current) => [
      ...inputs.map<AdminPhoto>((i) => ({
        id: i.id,
        year: i.year,
        // Appended at the end — the server actions already assign the real
        // sort_order; this local value is display-order only until reload.
        sortOrder: Number.MAX_SAFE_INTEGER,
        hidden: false,
        // Safe: a fresh row defaults to hidden = false, so the public route
        // already serves it — no signed URL needed for this session's uploads.
        thumbUrl: `/api/foto/${i.id}/thumb`,
        focalX: 50,
        focalY: 50,
        zoom: 1,
      })),
      ...current,
    ]);
  };

  const toggleHidden = async (photo: AdminPhoto) => {
    const nextHidden = !photo.hidden;
    setPhotos((current) => current.map((p) => (p.id === photo.id ? { ...p, hidden: nextHidden } : p)));
    const result = await setPhotoHidden(photo.id, nextHidden);
    if (!result.ok) {
      setPhotos((current) => current.map((p) => (p.id === photo.id ? { ...p, hidden: photo.hidden } : p)));
      toast.error(result.error ?? "Änderung fehlgeschlagen.");
      return;
    }
    toast.success(nextHidden ? "Foto verborgen." : "Foto wieder sichtbar.");
  };

  const [positioning, setPositioning] = useState<AdminPhoto | null>(null);
  const [positioningValue, setPositioningValue] = useState<FocalPoint>(DEFAULT_FOCAL);
  const [savingPosition, setSavingPosition] = useState(false);

  const openPositioning = (photo: AdminPhoto) => {
    setPositioning(photo);
    setPositioningValue({ focalX: photo.focalX, focalY: photo.focalY, zoom: photo.zoom });
  };

  const savePositioning = async () => {
    if (!positioning) return;
    setSavingPosition(true);
    const result = await setPhotoFocal(positioning.id, positioningValue);
    setSavingPosition(false);
    if (!result.ok) {
      toast.error(result.error ?? "Position konnte nicht gespeichert werden.");
      return;
    }
    setPhotos((current) =>
      current.map((p) => (p.id === positioning.id ? { ...p, ...positioningValue } : p))
    );
    toast.success("Position gespeichert.");
    setPositioning(null);
  };

  const [confirmDelete, setConfirmDelete] = useState<AdminPhoto | null>(null);
  const removePhoto = async (photo: AdminPhoto) => {
    setConfirmDelete(null);
    const result = await deleteGalleryPhoto(photo.id);
    if (!result.ok) {
      toast.error(result.error ?? "Löschen fehlgeschlagen.");
      return;
    }
    setPhotos((current) => current.filter((p) => p.id !== photo.id));
    toast.success("Foto gelöscht.");
  };

  const reorderWithinYear = async (year: number, orderedIds: string[]) => {
    setPhotos((current) => {
      const others = current.filter((p) => p.year !== year);
      const reordered = orderedIds
        .map((id) => current.find((p) => p.id === id))
        .filter((p): p is AdminPhoto => Boolean(p));
      return [...others, ...reordered].sort((a, b) => b.year - a.year);
    });
    const result = await reorderGalleryYear(orderedIds);
    if (!result.ok) toast.error(result.error ?? "Neue Reihenfolge fehlgeschlagen.");
  };

  return (
    <>
      <p className="a-label">Galerie</p>
      <h1 className="a-page-title">Impressionen</h1>
      <p className="a-page-lead">
        Kuratierte Auswahl, nicht das ganze Album — rechnet mit ~20–30 Fotos pro Jahr. Fürs volle
        Archiv bleibt der OneDrive-Link an die Eltern der separate Kanal.
      </p>

      <UploadPanel currentEditionYear={currentEditionYear} onUploaded={handleUploaded} />

      {years.length === 0 ? (
        <div className="a-notice" style={{ marginTop: "var(--space-15)" }}>
          <h2>Noch keine Fotos</h2>
          <p>Lade oben die ersten Bilder hoch — sie erscheinen danach hier, gruppiert nach Jahr.</p>
        </div>
      ) : (
        years.map((year) => (
          <YearGroup
            key={year}
            year={year}
            photos={photos.filter((p) => p.year === year).sort((a, b) => a.sortOrder - b.sortOrder)}
            onReorder={(ids) => void reorderWithinYear(year, ids)}
            onToggleHidden={(p) => void toggleHidden(p)}
            onDelete={(p) => setConfirmDelete(p)}
            onPosition={openPositioning}
          />
        ))
      )}

      <PositionDialog
        photo={positioning}
        value={positioningValue}
        onChange={setPositioningValue}
        onCancel={() => setPositioning(null)}
        onSave={() => void savePositioning()}
        saving={savingPosition}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Foto löschen?"
        question={
          confirmDelete ? (
            <>
              {confirmDelete.thumbUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={confirmDelete.thumbUrl}
                  alt=""
                  style={{
                    width: 96,
                    height: 96,
                    objectFit: "cover",
                    borderRadius: "var(--radius-input)",
                    marginBottom: "var(--space-9)",
                  }}
                />
              ) : null}
              <br />
              Dieses Foto aus {confirmDelete.year} wird endgültig gelöscht — alle drei Grössen.
              Das kann nicht rückgängig gemacht werden.
            </>
          ) : (
            ""
          )
        }
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && void removePhoto(confirmDelete)}
      />
    </>
  );
}

function YearGroup({
  year,
  photos,
  onReorder,
  onToggleHidden,
  onDelete,
  onPosition,
}: {
  year: number;
  photos: AdminPhoto[];
  onReorder: (ids: string[]) => void;
  onToggleHidden: (p: AdminPhoto) => void;
  onDelete: (p: AdminPhoto) => void;
  onPosition: (p: AdminPhoto) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(photos, oldIndex, newIndex).map((p) => p.id));
  };

  const visibleCount = photos.filter((p) => !p.hidden).length;

  return (
    <div>
      <div className="a-year-heading">
        <h2>{year}</h2>
        <span className="a-badge">
          {photos.length} Foto{photos.length === 1 ? "" : "s"}
          {visibleCount !== photos.length ? ` · ${photos.length - visibleCount} verborgen` : ""}
        </span>
      </div>

      {/* One DndContext per year — a photo can never be dropped into a
          different year's group by construction. */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
          <div className="a-photo-grid">
            {photos.map((photo) => (
              <PhotoTile
                key={photo.id}
                photo={photo}
                onToggleHidden={() => onToggleHidden(photo)}
                onDelete={() => onDelete(photo)}
                onPosition={() => onPosition(photo)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function PhotoTile({
  photo,
  onToggleHidden,
  onDelete,
  onPosition,
}: {
  photo: AdminPhoto;
  onToggleHidden: () => void;
  onDelete: () => void;
  onPosition: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`a-photo-tile ${photo.hidden ? "a-photo-tile-hidden" : ""}`}>
      {photo.hidden && <span className="a-photo-tile-badge">verborgen</span>}
      <div className="a-photo-tile-actions">
        <button
          type="button"
          className="a-icon-btn"
          onClick={onPosition}
          aria-label="Bildposition anpassen"
          title="Bildposition anpassen"
        >
          ⊹
        </button>
        <button
          type="button"
          className="a-icon-btn"
          onClick={onToggleHidden}
          aria-label={photo.hidden ? "Foto wieder anzeigen" : "Foto verbergen"}
          title={photo.hidden ? "Foto wieder anzeigen" : "Foto verbergen"}
        >
          {photo.hidden ? "◎" : "◉"}
        </button>
        <button
          type="button"
          className="a-icon-btn"
          onClick={onDelete}
          aria-label="Foto löschen"
          title="Foto löschen"
        >
          ✕
        </button>
      </div>
      <div className="a-photo-tile-grip" {...attributes} {...listeners} aria-label="Foto verschieben">
        {photo.thumbUrl ? (
          <PositionedImage
            src={photo.thumbUrl}
            alt=""
            focalX={photo.focalX}
            focalY={photo.focalY}
            zoom={photo.zoom}
            draggable={false}
          />
        ) : (
          <div style={{ width: "100%", height: "100%" }} />
        )}
      </div>
    </div>
  );
}

/** Same open/close pattern as ConfirmDialog.tsx, extracted here since this
    dialog isn't a yes/no confirmation. */
function useDialogOpen(open: boolean, onCancel: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onDialogCancel = (e: Event) => {
      e.preventDefault();
      onCancel();
    };
    el.addEventListener("cancel", onDialogCancel);
    return () => el.removeEventListener("cancel", onDialogCancel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

function PositionDialog({
  photo,
  value,
  onChange,
  onCancel,
  onSave,
  saving,
}: {
  photo: AdminPhoto | null;
  value: FocalPoint;
  onChange: (next: FocalPoint) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const dialogRef = useDialogOpen(!!photo, onCancel);

  return (
    <dialog ref={dialogRef} className="a-dialog" onClose={onCancel}>
      <h2>Bildposition anpassen</h2>
      {photo?.thumbUrl && (
        <FocalPointEditor src={photo.thumbUrl} aspectRatio="1 / 1" value={value} onChange={onChange} />
      )}
      <div className="a-dialog-actions">
        <button type="button" className="a-btn" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="button" className="a-btn a-btn-primary" onClick={onSave} disabled={saving}>
          {saving ? "Speichern …" : "Speichern"}
        </button>
      </div>
    </dialog>
  );
}
