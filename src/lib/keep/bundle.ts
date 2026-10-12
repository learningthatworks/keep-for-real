import { strToU8, zipSync } from "fflate";
import { fileSlug, noteToMarkdown } from "./formats.ts";
import { displayTitle, type KeepNote } from "./types.ts";

export function notesToMarkdownZip(notes: KeepNote[]): Uint8Array {
  const files: Record<string, Uint8Array> = {};
  const used = new Set<string>();
  notes.forEach((note, index) => {
    let name = fileSlug(displayTitle(note), index);
    while (used.has(name)) name = name.replace(/\.md$/, `-${used.size}.md`);
    used.add(name);
    files[name] = strToU8(noteToMarkdown(note, true));
    for (const attachment of note.attachments) {
      if (!attachment.bytes || attachment.bytes.byteLength === 0) continue;
      const path = `attachments/${attachment.name}`;
      if (!files[path]) files[path] = attachment.bytes;
    }
  });
  return zipSync(files);
}
