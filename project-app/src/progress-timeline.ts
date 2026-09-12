import { dayKey } from "./care-data.ts";
import type { ActivityEntry, CareStore } from "./care-data";

export type TimelineItem = Omit<ActivityEntry, "kind"> & {
  kind: ActivityEntry["kind"] | "comment";
  entryId: string;
};
export type TimelineTrack = "voice" | "user" | "physio" | "agent";
export const timelineDayValue = (date: string) => Date.parse(`${dayKey(date)}T12:00:00Z`);
export const activityAnchor = (id: string) => `activity-entry-${encodeURIComponent(id)}`;

/** Include every record and saved comment, with comments dated when they were added. */
export function buildProgressTimeline(entries: ActivityEntry[], updates: CareStore["updates"]): TimelineItem[] {
  const items = new Map<string, TimelineItem>();
  for (const entry of entries) {
    const id = `entry:${entry.id}`;
    items.set(id, { ...entry, id, entryId: entry.id });
    for (const note of updates[entry.id]?.notes ?? []) {
      const commentId = `comment:${note.id}`;
      items.set(commentId, {
        id: commentId, entryId: entry.id, date: note.date, actor: note.actor,
        title: `Note on ${entry.title}`, body: note.text, kind: "comment",
        source: "local", region: entry.region,
      });
    }
  }
  return [...items.values()].sort((a, b) => Date.parse(a.date) - Date.parse(b.date) || a.id.localeCompare(b.id));
}

export function timelineTrack(item: TimelineItem): TimelineTrack {
  return item.kind === "voice" ? "voice" : item.actor;
}

export function timelineRange(items: TimelineItem[], scores: { date: string }[]) {
  const dates = [...items, ...scores].map(item => timelineDayValue(item.date));
  const start = Math.min(...dates);
  // Keep a useful horizontal scale even if the record contains just one date.
  const end = Math.max(start + 86400000, ...dates);
  return { start, end, fraction: (date: string) => (timelineDayValue(date) - start) / (end - start) };
}

/** Pack close/coincident dates into separate lanes; never hide a record behind another. */
export function layoutTimelineTrack(items: TimelineItem[], fraction: (date: string) => number) {
  const laneEnds: number[] = [];
  // Reserve room for a visible note excerpt as well as its numbered date pin.
  const intervals = items.map(item => {
    const position = fraction(item.date);
    const rightAligned = position > 0.5;
    const left = position * 620 - (rightAligned ? 191 : 15);
    return { item, position: position * 100, rightAligned, left, right: left + 206 };
  }).sort((a, b) => a.left - b.left || Date.parse(a.item.date) - Date.parse(b.item.date));
  const placements = intervals.map(placement => {
    let lane = laneEnds.findIndex(end => placement.left - end >= 10);
    if (lane < 0) lane = laneEnds.length;
    laneEnds[lane] = placement.right;
    return { ...placement, lane };
  });
  return { placements, height: Math.max(1, laneEnds.length) * 38 + 20 };
}
