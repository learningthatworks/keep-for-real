export type CheckItem = { text: string; checked: boolean };

export type Attachment = {
  name: string;
  mime: string;
  bytes?: Uint8Array;
  path?: string;
};

export type KeepNote = {
  id: string;
  title: string;
  body: string;
  items: CheckItem[];
  tags: string[];
  color: string;
  pinned: boolean;
  archived: boolean;
  trashed: boolean;
  created: string | null;
  updated: string | null;
  attachments: Attachment[];
};

export function makeId(seed: string, index: number): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `n${index.toString(36)}-${(h >>> 0).toString(36)}`;
}

export function displayTitle(note: KeepNote): string {
  const title = note.title.trim();
  if (title) return title;
  const first = notePlain(note).split("\n").find((line) => line.trim());
  return first?.trim() || "Untitled";
}

export function notePlain(note: KeepNote): string {
  const lines: string[] = [];
  for (const item of note.items) {
    lines.push(`${item.checked ? "[x]" : "[ ]"} ${item.text}`);
  }
  if (note.body.trim()) lines.push(note.body.trim());
  return lines.join("\n").trim();
}

export function blankNote(partial: Partial<KeepNote> & Pick<KeepNote, "title">): KeepNote {
  return {
    id: partial.id ?? "",
    title: partial.title,
    body: partial.body ?? "",
    items: partial.items ?? [],
    tags: partial.tags ?? [],
    color: partial.color ?? "DEFAULT",
    pinned: partial.pinned ?? false,
    archived: partial.archived ?? false,
    trashed: partial.trashed ?? false,
    created: partial.created ?? null,
    updated: partial.updated ?? null,
    attachments: partial.attachments ?? [],
  };
}

export function assignIds(notes: KeepNote[]): KeepNote[] {
  return notes.map((note, index) => ({
    ...note,
    id: note.id || makeId(`${note.title}\n${note.body}\n${note.created ?? ""}`, index),
  }));
}

export function guessMime(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    wav: "audio/wav",
    ogg: "audio/ogg",
    mp4: "video/mp4",
    "3gp": "video/3gpp",
  };
  return map[ext] ?? "application/octet-stream";
}

export function baseName(path: string): string {
  const clean = path.replace(/\\/g, "/").split("/").pop() || "file";
  try {
    return decodeURIComponent(clean);
  } catch {
    return clean;
  }
}
