"use client";

import { useCallback, useId, useRef, useState } from "react";
import { filesFromDataTransfer } from "@/lib/gallery/drop-files";
import { resolvePhotoYear } from "@/lib/gallery/exif";
import { isSupportedPhoto, uploadGalleryPhoto, deleteGalleryObjects } from "@/lib/gallery/upload";
import { useToast } from "@/lib/admin/toast";
import { runWithConcurrency } from "@/lib/gallery/pool";
import { insertGalleryPhotos, type NewPhotoInput } from "./actions";

const CONCURRENCY = 3;

type Status = "pending" | "uploading" | "done" | "error";

interface StagedFile {
  key: string;
  file: File;
  year: number;
  previewUrl: string;
  status: Status;
  progress: number;
  error?: string;
}

interface Summary {
  succeeded: number;
  failed: number;
  totalBytes: number;
  elapsedMs: number;
}

/** DOM input attributes TS doesn't type: lets a picker choose a whole folder. */
type FolderInputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & { webkitdirectory?: string; directory?: string };
const FolderInput = (props: FolderInputProps) => <input {...props} />;

export default function UploadPanel({
  currentEditionYear,
  onUploaded,
}: {
  currentEditionYear: number;
  onUploaded: (photos: NewPhotoInput[]) => void;
}) {
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [batchYear, setBatchYear] = useState(currentEditionYear);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputId = useId();
  const folderInputId = useId();
  const toast = useToast();

  const addFiles = useCallback(
    (incoming: File[]) => {
      if (incoming.length === 0) return;
      const entries: StagedFile[] = incoming.map((file) => ({
        key: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
        file,
        year: currentEditionYear,
        previewUrl: URL.createObjectURL(file),
        status: isSupportedPhoto(file) ? "pending" : "error",
        progress: 0,
        error: isSupportedPhoto(file) ? undefined : "Nicht unterstütztes Dateiformat.",
      }));
      setStaged((current) => [...current, ...entries]);
      setSummary(null);

      // Resolve each file's year (EXIF → file date → current edition) in the
      // background; editable afterwards, doesn't block the list appearing.
      for (const entry of entries) {
        if (entry.status !== "pending") continue;
        void resolvePhotoYear(entry.file, currentEditionYear).then((year) => {
          setStaged((current) => current.map((s) => (s.key === entry.key ? { ...s, year } : s)));
        });
      }
    },
    [currentEditionYear]
  );

  const removeStaged = (key: string) => {
    setStaged((current) => {
      const target = current.find((s) => s.key === key);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((s) => s.key !== key);
    });
  };

  const clearFinished = () => {
    setStaged((current) => {
      for (const s of current) {
        if (s.status === "done") URL.revokeObjectURL(s.previewUrl);
      }
      return current.filter((s) => s.status !== "done");
    });
  };

  const applyBatchYear = () => {
    setStaged((current) =>
      current.map((s) => (s.status === "pending" || s.status === "error" ? { ...s, year: batchYear } : s))
    );
  };

  const setStagedPatch = (key: string, patch: Partial<StagedFile>) => {
    setStaged((current) => current.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  };

  const uploadOne = async (staged: StagedFile) => {
    setStagedPatch(staged.key, { status: "uploading", progress: 0, error: undefined });
    try {
      const uploaded = await uploadGalleryPhoto(staged.file, {
        year: staged.year,
        onProgress: (fraction) => setStagedPatch(staged.key, { progress: fraction }),
      });

      const input: NewPhotoInput = {
        id: uploaded.id,
        year: uploaded.year,
        paths: uploaded.paths,
        dimensions: uploaded.dimensions,
        blurDataUrl: uploaded.blurDataUrl,
      };
      const result = await insertGalleryPhotos([input]);
      if (!result.ok) {
        await deleteGalleryObjects(Object.values(uploaded.paths));
        setStagedPatch(staged.key, { status: "error", error: result.error ?? "Speichern fehlgeschlagen." });
        return { ok: false as const, bytes: 0 };
      }

      setStagedPatch(staged.key, { status: "done", progress: 1 });
      onUploaded([input]);
      return { ok: true as const, bytes: uploaded.bytes };
    } catch (e) {
      setStagedPatch(staged.key, {
        status: "error",
        error: e instanceof Error ? e.message : "Hochladen fehlgeschlagen.",
      });
      return { ok: false as const, bytes: 0 };
    }
  };

  const startUpload = async () => {
    const queue = staged.filter((s) => s.status === "pending");
    if (queue.length === 0) return;
    setUploading(true);
    const startedAt = Date.now();

    const results = await runWithConcurrency(queue, CONCURRENCY, uploadOne);

    const succeeded = results.filter((r) => r.ok).length;
    const failed = results.length - succeeded;
    const totalBytes = results.reduce((sum, r) => sum + r.bytes, 0);
    setSummary({ succeeded, failed, totalBytes, elapsedMs: Date.now() - startedAt });
    setUploading(false);

    if (failed === 0) toast.success(`${succeeded} Foto${succeeded === 1 ? "" : "s"} hochgeladen.`);
    else toast.error(`${failed} von ${results.length} Fotos fehlgeschlagen — siehe Liste unten.`);
  };

  const retryOne = (key: string) => {
    const item = staged.find((s) => s.key === key);
    if (item) void uploadOne(item);
  };

  const pendingCount = staged.filter((s) => s.status === "pending").length;
  const hasFinished = staged.some((s) => s.status === "done");

  return (
    <div className="a-card">
      <div className="a-card-head">
        <h2 className="a-card-title">Fotos hochladen</h2>
      </div>

      <div
        className={`a-upload-drop ${dragOver ? "a-upload-drop-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void filesFromDataTransfer(e.dataTransfer).then(addFiles);
        }}
      >
        <strong>Fotos oder einen ganzen Ordner hierher ziehen</strong>
        <span>JPG, PNG, WebP oder HEIC — mehrere Dateien gleichzeitig möglich</span>
        <div className="a-upload-drop-actions">
          <label htmlFor={filesInputId} className="a-btn a-btn-sm">
            Dateien auswählen
          </label>
          <input
            id={filesInputId}
            ref={filesInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="a-visually-hidden"
            onChange={(e) => {
              addFiles(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
          <label htmlFor={folderInputId} className="a-btn a-btn-sm">
            Ordner auswählen
          </label>
          <FolderInput
            id={folderInputId}
            ref={folderInputRef}
            type="file"
            multiple
            webkitdirectory=""
            directory=""
            className="a-visually-hidden"
            onChange={(e) => {
              addFiles(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {staged.length > 0 && (
        <>
          <div className="a-batch-row">
            <label htmlFor="batch-year" style={{ fontSize: "var(--font-size-sm4)" }}>
              Jahr für alle wartenden Fotos:
            </label>
            <input
              id="batch-year"
              type="number"
              className="a-staged-year"
              value={batchYear}
              min={2000}
              max={2100}
              onChange={(e) => setBatchYear(Number(e.target.value))}
            />
            <button type="button" className="a-btn a-btn-sm" onClick={applyBatchYear}>
              Anwenden
            </button>

            <button
              type="button"
              className="a-btn a-btn-primary"
              style={{ marginLeft: "auto" }}
              onClick={() => void startUpload()}
              disabled={uploading || pendingCount === 0}
            >
              {uploading
                ? "Wird hochgeladen …"
                : `${pendingCount} Foto${pendingCount === 1 ? "" : "s"} hochladen`}
            </button>
          </div>

          <div className="a-staged-list">
            {staged.map((s) => (
              <StagedRow
                key={s.key}
                staged={s}
                onYearChange={(year) => setStagedPatch(s.key, { year })}
                onRemove={() => removeStaged(s.key)}
                onRetry={() => retryOne(s.key)}
              />
            ))}
          </div>

          {hasFinished && !uploading && (
            <div style={{ marginTop: "var(--space-9)" }}>
              <button type="button" className="a-btn a-btn-sm" onClick={clearFinished}>
                Erledigte aus der Liste entfernen
              </button>
            </div>
          )}
        </>
      )}

      {summary && (
        <div className="a-summary">
          <div className="a-summary-stat">
            <strong>{summary.succeeded}</strong>
            <span>Hochgeladen</span>
          </div>
          <div className="a-summary-stat">
            <strong>{summary.failed}</strong>
            <span>Fehlgeschlagen</span>
          </div>
          <div className="a-summary-stat">
            <strong>{formatBytes(summary.totalBytes)}</strong>
            <span>Gesamtgrösse</span>
          </div>
          <div className="a-summary-stat">
            <strong>{formatDuration(summary.elapsedMs)}</strong>
            <span>Dauer</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StagedRow({
  staged,
  onYearChange,
  onRemove,
  onRetry,
}: {
  staged: StagedFile;
  onYearChange: (year: number) => void;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const editable = staged.status === "pending" || staged.status === "error";

  return (
    <div className={`a-staged-row ${staged.status === "error" ? "a-staged-row-error" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="a-staged-thumb" src={staged.previewUrl} alt="" />

      <div className="a-staged-body">
        <div className="a-staged-name">{staged.file.name}</div>
        <div className="a-staged-meta">
          <span style={{ fontSize: "var(--font-size-3xs)", color: "var(--color-text-muted)" }}>
            {formatBytes(staged.file.size)}
          </span>
          <input
            type="number"
            className="a-staged-year"
            value={staged.year}
            min={2000}
            max={2100}
            disabled={!editable}
            onChange={(e) => onYearChange(Number(e.target.value))}
            aria-label={`Jahr für ${staged.file.name}`}
          />
          {staged.status === "error" ? (
            <span style={{ fontSize: "var(--font-size-3xs)", color: "var(--color-danger-text)" }}>
              {staged.error}
            </span>
          ) : (
            <div className="a-progress">
              <div className="a-progress-bar" style={{ width: `${Math.round(staged.progress * 100)}%` }} />
            </div>
          )}
        </div>
      </div>

      <div className="a-staged-actions">
        {staged.status === "error" && (
          <button type="button" className="a-btn a-btn-sm" onClick={onRetry}>
            Erneut
          </button>
        )}
        {editable && (
          <button type="button" className="a-btn a-btn-sm a-btn-danger" onClick={onRemove}>
            ✕
          </button>
        )}
        {staged.status === "done" && <span aria-hidden="true">✓</span>}
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes} Min ${seconds} s` : `${seconds} s`;
}
