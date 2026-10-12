import { unzip } from "fflate";
import { parseKeepHtml } from "./html.ts";
import { parseKeepJson } from "./json.ts";
import { assignIds, baseName, guessMime, type KeepNote } from "./types.ts";

export type NamedBytes = { name: string; bytes: Uint8Array };

export type ReadResult = { notes: KeepNote[]; warnings: string[] };

function unzipBytes(data: Uint8Array): Promise<Record<string, Uint8Array>> {
  return new Promise((resolve, reject) => {
    unzip(data, (error, result) => (error ? reject(error) : resolve(result)));
  });
}

function decodeText(bytes: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

function stemOf(path: string): string {
  return path.replace(/\\/g, "/").replace(/\.[^.]+$/, "").toLowerCase();
}

function merge(primary: KeepNote, extra: KeepNote): KeepNote {
  const tags = [...primary.tags];
  for (const tag of extra.tags) {
    if (!tags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) tags.push(tag);
  }
  const attachments = [...primary.attachments];
  for (const attachment of extra.attachments) {
    const exists = attachments.some(
      (current) => current.name === attachment.name || (current.path && current.path === attachment.path),
    );
    if (!exists) attachments.push(attachment);
  }
  return {
    ...primary,
    title: primary.title || extra.title,
    body: primary.body.trim() ? primary.body : extra.body,
    items: primary.items.length ? primary.items : extra.items,
    tags,
    color: primary.color !== "DEFAULT" ? primary.color : extra.color,
    pinned: primary.pinned || extra.pinned,
    archived: primary.archived || extra.archived,
    trashed: primary.trashed || extra.trashed,
    created: primary.created || extra.created,
    updated: primary.updated || extra.updated,
    attachments,
  };
}

function parseCsv(text: string): KeepNote[] {
  const rows = csvRows(text.replace(/^\uFEFF/, ""));
  if (rows.length < 2) return [];
  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const index = (names: string[]) => header.findIndex((cell) => names.includes(cell));
  const titleI = index(["title", "name"]);
  const bodyI = index(["content", "body", "text", "textcontent"]);
  if (titleI < 0 && bodyI < 0) return [];
  const tagsI = index(["labels", "tags"]);
  const pinnedI = index(["pinned", "ispinned"]);
  const archivedI = index(["archived", "isarchived"]);
  const trashedI = index(["trashed", "istrashed"]);
  const colorI = index(["color"]);
  const createdI = index(["created", "createdtimestampusec"]);
  const updatedI = index(["updated", "usereditedtimestampusec"]);
  return rows.slice(1).flatMap((row) => {
    if (row.every((cell) => !cell.trim())) return [];
    const note = parseKeepJson({
      title: titleI >= 0 ? row[titleI] : "",
      body: bodyI >= 0 ? row[bodyI] : "",
      tags: tagsI >= 0 ? row[tagsI].split(/[;,]/).map((tag) => tag.trim()).filter(Boolean) : [],
      pinned: pinnedI >= 0 ? /^true|yes|1$/i.test(row[pinnedI] || "") : false,
      archived: archivedI >= 0 ? /^true|yes|1$/i.test(row[archivedI] || "") : false,
      trashed: trashedI >= 0 ? /^true|yes|1$/i.test(row[trashedI] || "") : false,
      color: colorI >= 0 ? row[colorI] : "DEFAULT",
      created: createdI >= 0 ? row[createdI] : null,
      updated: updatedI >= 0 ? row[updatedI] : null,
    });
    return note;
  });
}

function csvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") cell += char;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

async function expand(entries: NamedBytes[], warnings: string[]): Promise<NamedBytes[]> {
  const out: NamedBytes[] = [];
  for (const entry of entries) {
    const lower = entry.name.toLowerCase();
    if (lower.endsWith(".zip")) {
      try {
        const unzipped = await unzipBytes(entry.bytes);
        for (const [path, bytes] of Object.entries(unzipped)) {
          if (!path || path.endsWith("/") || path.includes("__MACOSX") || path.split("/").pop()?.startsWith(".")) {
            continue;
          }
          out.push({ name: path, bytes });
        }
      } catch {
        warnings.push(`${baseName(entry.name)} is not a zip this app can read. Export Takeout as a .zip, or drop the HTML and JSON files.`);
      }
    } else if (lower.endsWith(".tgz") || lower.endsWith(".tar.gz")) {
      warnings.push("This archive is .tgz. In Takeout, choose .zip, or unzip it and drop the notes folder.");
    } else {
      out.push(entry);
    }
  }
  return out;
}

function attachBytes(notes: KeepNote[], files: NamedBytes[]) {
  const byPath = new Map<string, Uint8Array>();
  const byBase = new Map<string, Uint8Array>();
  for (const file of files) {
    const path = file.name.replace(/\\/g, "/").toLowerCase();
    byPath.set(path, file.bytes);
    const base = path.split("/").pop() ?? path;
    if (!byBase.has(base)) byBase.set(base, file.bytes);
  }
  for (const note of notes) {
    for (const attachment of note.attachments) {
      if (attachment.bytes) continue;
      const path = attachment.path?.replace(/\\/g, "/").toLowerCase();
      const bytes = (path && byPath.get(path)) || byBase.get(attachment.name.toLowerCase());
      if (!bytes) continue;
      attachment.bytes = bytes;
      if (!attachment.mime || attachment.mime === "application/octet-stream") {
        attachment.mime = guessMime(attachment.name);
      }
    }
  }
}

export async function notesFromNamedBytes(entries: NamedBytes[]): Promise<ReadResult> {
  const warnings: string[] = [];
  const files = await expand(entries, warnings);
  const buckets = new Map<string, { json: KeepNote[]; html: KeepNote[] }>();
  const loose: KeepNote[] = [];

  const bucket = (path: string) => {
    const key = stemOf(path);
    let current = buckets.get(key);
    if (!current) {
      current = { json: [], html: [] };
      buckets.set(key, current);
    }
    return current;
  };

  for (const file of files) {
    const lower = file.name.toLowerCase();
    if (lower.endsWith("archive_browser.html")) continue;
    try {
      if (lower.endsWith(".json")) {
        const parsed = parseKeepJson(JSON.parse(decodeText(file.bytes)));
        if (parsed.length === 1) bucket(file.name).json = parsed;
        else if (parsed.length > 1) loose.push(...parsed);
      } else if (lower.endsWith(".html") || lower.endsWith(".htm")) {
        const parsed = parseKeepHtml(decodeText(file.bytes));
        if (parsed.length === 1) bucket(file.name).html = parsed;
        else loose.push(...parsed);
      } else if (lower.endsWith(".csv")) {
        loose.push(...parseCsv(decodeText(file.bytes)));
      } else if (lower.endsWith(".txt")) {
        const text = decodeText(file.bytes).trim();
        if (!text) continue;
        loose.push(
          ...parseKeepJson({
            title: baseName(file.name).replace(/\.txt$/i, ""),
            body: text,
          }),
        );
      }
    } catch {
      warnings.push(`Could not read ${baseName(file.name)}.`);
    }
  }

  const notes: KeepNote[] = [...loose];
  for (const group of buckets.values()) {
    if (group.json.length === 1 && group.html.length === 1) notes.push(merge(group.json[0], group.html[0]));
    else notes.push(...group.json, ...group.html);
  }

  attachBytes(notes, files);
  const ready = assignIds(notes.filter((note) => note.title || note.body || note.items.length || note.attachments.length));
  if (ready.length === 0) {
    warnings.push("No Keep notes found. Paste notes, or drop Keep HTML, JSON, or a Takeout zip.");
  }
  return { notes: ready, warnings };
}

export function parsePaste(text: string): KeepNote[] {
  const trimmed = text.replace(/\r\n/g, "\n").trim();
  if (!trimmed) return [];
  const chunks = trimmed.split(/\n[ \t]*(?:---|\*\*\*)[ \t]*\n/).map((chunk) => chunk.trim()).filter(Boolean);
  const notes = chunks.map((chunk) => {
    const lines = chunk.split("\n");
    let title = "";
    let rest = chunk;
    if (lines.length > 1) {
      title = lines[0].replace(/^#\s+/, "").trim();
      rest = lines.slice(1).join("\n").trim();
    } else if (lines[0]?.startsWith("# ")) {
      title = lines[0].slice(2).trim();
      rest = "";
    }
    const items: KeepNote["items"] = [];
    const bodyLines: string[] = [];
    for (const line of rest.split("\n")) {
      const item = /^\s*[-*]\s+\[( |x|X)\]\s+(.*)$/.exec(line);
      if (item) items.push({ text: item[2].trim(), checked: item[1].toLowerCase() === "x" });
      else bodyLines.push(line);
    }
    return parseKeepJson({
      title,
      body: bodyLines.join("\n").trim(),
      items,
    })[0];
  });
  return assignIds(notes.filter((note): note is KeepNote => Boolean(note)));
}
