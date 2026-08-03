"use client";

import { useId, useRef, useState } from "react";
import { mediaUrl } from "@/lib/media/url";
import { uploadContentImage } from "@/lib/media/upload";
import { isSupportedImage } from "@/lib/media/resize";

export interface ImageFieldProps {
  /** Registry key — becomes the storage folder AND identifies the value. */
  fieldKey: string;
  /** Human label ("Hero-Bild 1"). */
  label: string;
  help?: string;
  /** Current stored value (either a legacy `/Bilder/…` or a `media/` bucket path). */
  value: string | null;
  /** Called with the new path (or null when removed). Parent owns the value. */
  onChange: (nextPath: string | null) => void;
}

/**
 * A single image slot: drop or click to upload, live preview, remove.
 *
 * Uploads happen straight to Supabase Storage from the browser using the
 * admin's own session — the "media: admin insert" RLS policy from the media
 * migration is what actually authorises the write. No bytes flow through
 * Next; only the final object PATH is passed back and later saved via the
 * form's Server Action.
 *
 * Alt text lives in the parent form so a single set of language tabs covers
 * both text and image alt inputs.
 */
export default function ImageField(props: ImageFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const previewUrl = mediaUrl(props.value);

  const handleFile = async (file: File) => {
    setError(null);
    if (!isSupportedImage(file)) {
      setError("Nur JPG, PNG oder WebP werden unterstützt.");
      return;
    }
    setUploading(true);
    try {
      const result = await uploadContentImage(file, props.fieldKey);
      props.onChange(result.path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="a-field">
      <div className="a-field-label">{props.label}</div>
      {props.help ? <p className="a-field-help">{props.help}</p> : null}

      <div className="a-image">
        {previewUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img className="a-image-preview" src={previewUrl} alt="" />
        ) : (
          <div className="a-image-preview a-image-empty">Platzhalter — noch kein Bild</div>
        )}

        <label
          htmlFor={inputId}
          className={`a-image-drop ${dragOver ? "a-image-drop-over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
        >
          {uploading ? (
            <>Wird hochgeladen …</>
          ) : props.value ? (
            <>
              <strong>Bild ersetzen</strong>
              <span>Datei hierher ziehen oder klicken</span>
            </>
          ) : (
            <>
              <strong>Bild hochladen</strong>
              <span>Datei hierher ziehen oder klicken · max. 12 MB</span>
            </>
          )}
          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="a-visually-hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {error ? (
        <p role="alert" className="a-error" style={{ marginTop: "var(--space-8)" }}>
          {error}
        </p>
      ) : null}

      {props.value ? (
        <div style={{ marginTop: "var(--space-9)" }}>
          <button
            type="button"
            className="a-btn a-btn-sm a-btn-danger"
            onClick={() => props.onChange(null)}
          >
            Bild entfernen
          </button>
        </div>
      ) : null}
    </div>
  );
}
