import SparkMD5 from "spark-md5";
import { evernoteStamp } from "./dates.ts";
import { displayTitle, notePlain, type KeepNote } from "./types.ts";

function xml(value: string): string {
  return value
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

function md5Hex(bytes: Uint8Array): string {
  const buffer =
    bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength
      ? bytes.buffer
      : bytes.slice().buffer;
  return SparkMD5.ArrayBuffer.hash(buffer as ArrayBuffer);
}

function tagValue(value: string): string | null {
  const clean = value.replace(/[\u0000-\u001f]/g, "").replace(/,/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) return null;
  return clean.slice(0, 100);
}

function enml(note: KeepNote): string {
  const chunks: string[] = [];
  for (const item of note.items) {
    chunks.push(`<div><en-todo checked="${item.checked ? "true" : "false"}"/>${xml(item.text)}</div>`);
  }
  const body = note.body.replace(/\r\n/g, "\n");
  if (body.trim() || (!note.items.length && !note.attachments.length)) {
    const lines = body.length ? body.split("\n") : [];
    if (lines.length === 0 && chunks.length === 0) chunks.push("<div><br/></div>");
    for (const line of lines) {
      chunks.push(line.trim() ? `<div>${xml(line)}</div>` : "<div><br/></div>");
    }
  }
  for (const attachment of note.attachments) {
    if (attachment.bytes && attachment.bytes.byteLength > 0) {
      const hash = md5Hex(attachment.bytes);
      chunks.push(`<div><en-media hash="${hash}" type="${xml(attachment.mime)}"/></div>`);
    } else if (attachment.name) {
      chunks.push(`<div>${xml(`Attachment: ${attachment.name}`)}</div>`);
    }
  }
  if (chunks.length === 0) chunks.push("<div><br/></div>");
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n` +
    `<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\n` +
    `<en-note>${chunks.join("")}</en-note>`
  );
}

function noteXml(note: KeepNote): string {
  const title = xml(displayTitle(note).slice(0, 255));
  const tags: string[] = [];
  const pushTag = (value: string) => {
    const clean = tagValue(value);
    if (!clean) return;
    if (tags.some((tag) => tag.toLowerCase() === clean.toLowerCase())) return;
    tags.push(clean);
  };
  for (const tag of note.tags) pushTag(tag);
  if (note.pinned) pushTag("pinned");
  if (note.archived) pushTag("archived");
  if (note.trashed) pushTag("trashed");

  const created = evernoteStamp(note.created);
  const updated = evernoteStamp(note.updated);
  const resources = note.attachments
    .filter((attachment) => attachment.bytes && attachment.bytes.byteLength > 0)
    .map((attachment) => {
      const bytes = attachment.bytes as Uint8Array;
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
      }
      const encoded = btoa(binary);
      return (
        `<resource><data encoding="base64">${encoded}</data>` +
        `<mime>${xml(attachment.mime)}</mime>` +
        `<resource-attributes><file-name>${xml(attachment.name)}</file-name></resource-attributes>` +
        `</resource>`
      );
    })
    .join("");

  return (
    `<note><title>${title}</title>` +
    `<content>${cdata(enml(note))}</content>` +
    (created ? `<created>${created}</created>` : "") +
    (updated ? `<updated>${updated}</updated>` : "") +
    tags.map((tag) => `<tag>${xml(tag)}</tag>`).join("") +
    `<note-attributes><source>google-keep</source><source-application>Keep for Real</source-application></note-attributes>` +
    resources +
    `</note>`
  );
}

export function notesToEnex(notes: KeepNote[]): string {
  const exported = evernoteStamp(new Date().toISOString()) ?? "19700101T000000Z";
  const body = notes.map(noteXml).join("");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<!DOCTYPE en-export SYSTEM "http://xml.evernote.com/pub/evernote-export3.dtd">\n` +
    `<en-export export-date="${exported}" application="Keep for Real" version="1.0">` +
    body +
    `</en-export>\n`
  );
}

export function enexLooksUseful(notes: KeepNote[]): boolean {
  return notes.some((note) => displayTitle(note) !== "Untitled" || notePlain(note) || note.attachments.length);
}
