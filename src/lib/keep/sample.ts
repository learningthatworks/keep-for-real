import { assignIds, blankNote, type KeepNote } from "./types.ts";

const samples: KeepNote[] = [
  blankNote({
    title: "Research question",
    body: "Why does the north bank run more turbid after rain than the gauge suggests? Compare the June log before writing the methods section.",
    tags: ["research", "field"],
    pinned: true,
    created: "2024-06-02T15:10:00.000Z",
    updated: "2024-10-03T18:04:00.000Z",
  }),
  blankNote({
    title: "Sources to pull",
    items: [
      { text: "Smith 2019 on bank erosion", checked: false },
      { text: "City gauge data, 2018–2024", checked: true },
      { text: "Interview transcript, 12 May", checked: false },
    ],
    tags: ["research"],
    created: "2024-05-12T11:00:00.000Z",
    updated: "2024-09-30T09:12:00.000Z",
  }),
  blankNote({
    title: "Draft abstract",
    body: "Three bends on the same river do not share one sediment story. Rain, cattle access, and a repaired culvert show up as separate signals in the notes.",
    tags: ["draft", "research"],
    color: "BLUE",
    created: "2024-08-19T13:40:00.000Z",
    updated: "2024-10-01T16:22:00.000Z",
  }),
  blankNote({
    title: "Aside — discarded framing",
    body: "The first framing blamed the dam alone. The notes from week two do not support that, so this version stays archived.",
    tags: ["research"],
    archived: true,
    created: "2024-07-01T08:05:00.000Z",
    updated: "2024-07-04T08:05:00.000Z",
  }),
  blankNote({
    title: "Lab meeting, 3 Oct",
    body: "Decision: move the working notes into Evernote, and keep labels as tags. Follow up on the missing photo set separately.",
    tags: ["meeting"],
    created: "2024-10-03T17:30:00.000Z",
    updated: "2024-10-03T17:48:00.000Z",
  }),
];

export function sampleNotes(): KeepNote[] {
  return assignIds(samples);
}
