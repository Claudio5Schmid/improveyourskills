"use client";

/**
 * Flatten a drag-and-drop payload into a plain file list, walking into
 * dropped folders (the brief explicitly asks for "drop a folder / multi-
 * select"). Uses the WebKit directory-entry API, supported in every current
 * desktop browser for drag-and-drop; falls back to the flat file list if a
 * browser doesn't expose it (nothing breaks, folders just wouldn't recurse).
 */
export async function filesFromDataTransfer(dataTransfer: DataTransfer): Promise<File[]> {
  const items = Array.from(dataTransfer.items);
  const entries = items
    .map((item) => item.webkitGetAsEntry?.())
    .filter((e): e is FileSystemEntry => Boolean(e));

  if (entries.length === 0) {
    return Array.from(dataTransfer.files);
  }

  const files: File[] = [];
  for (const entry of entries) {
    await walkEntry(entry, files);
  }
  return files;
}

async function walkEntry(entry: FileSystemEntry, out: File[]): Promise<void> {
  if (entry.isFile) {
    const file = await new Promise<File>((resolve, reject) => {
      (entry as FileSystemFileEntry).file(resolve, reject);
    });
    out.push(file);
    return;
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const children = await readAllEntries(reader);
    for (const child of children) await walkEntry(child, out);
  }
}

/** `readEntries` only returns a batch at a time — must be called until empty. */
function readAllEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => {
    const all: FileSystemEntry[] = [];
    const readBatch = () => {
      reader.readEntries((batch) => {
        if (batch.length === 0) {
          resolve(all);
          return;
        }
        all.push(...batch);
        readBatch();
      }, reject);
    };
    readBatch();
  });
}
