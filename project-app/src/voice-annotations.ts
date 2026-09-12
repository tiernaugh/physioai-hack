import { regions } from "./data.ts";
import type { RegionId } from "./data";

export type VoiceInsight = {
  id: string;
  region: RegionId | null;
  quote: string;
  start: number;
  end: number;
  title: string;
  detail: string;
  needsReview: boolean;
};
export type Annotation = { id: string; region: RegionId; label: string };
export type AnnotationEdit = { region: RegionId | null; reviewed: boolean };
export type AnnotationEdits = Record<string, Record<string, AnnotationEdit>>;
export const annotationStorageKey = "ai-physio:v1:voice-annotations";
export const sampleVoiceTranscript =
  "My left hamstring feels tight after my walk today. My right shoulder feels stiff today. The discomfort in my left calf is two out of ten.";

// Source-backed indexing, not clinical interpretation. Keep exact text and never
// infer a side from exercises, earlier sentences, pronouns or the selected body.
export function deriveVoiceInsights(transcript: string): VoiceInsight[] {
  const results: VoiceInsight[] = [];
  const anatomy =
    /\b(hamstrings?|shoulders?|knees?|hips?|calf|calves|ankles?|chest|core|abdominals?|lower back|lumbar|neck|elbows?|wrists?|thighs?|back|legs?|arms?)\b/i;
  const sided =
    /\b(left|right|both)\s+(hamstrings?|shoulders?|knees?|hips?|calf|calves|ankles?)\b/gi;
  // Split at sentence ends but retain decimals and source offsets.
  const segments = [
    ...transcript.matchAll(/[^.!?\n]+(?:\.(?=\d)[^.!?\n]+)*(?:[.!?](?!\d)|$)/g),
  ];
  for (const segment of segments) {
    const raw = segment[0];
    const quote = raw.trim();
    if (!quote || !anatomy.test(quote)) continue;
    const start = segment.index! + raw.indexOf(quote);
    const end = start + quote.length;
    const correction =
      /\b(actually|instead|correction|meant|not (?:my |the )?(?:left|right)|rather than)\b/i.test(
        quote,
      );
    const matched = [...quote.matchAll(sided)];
    const mapped = new Set<RegionId>();
    if (!correction) {
      for (const match of matched) {
        const part = match[2]
          .toLowerCase()
          .replace(/calves/, "calf")
          .replace(/s$/, "");
        for (const side of match[1].toLowerCase() === "both"
          ? ["left", "right"]
          : [match[1].toLowerCase()]) {
          const region = `${side}-${part}` as RegionId;
          if (regions.some((r) => r.id === region)) mapped.add(region);
        }
      }
      if (/\b(lower back|lumbar)\b/i.test(quote)) mapped.add("lower-back");
      if (/\b(core|abdominals?)\b/i.test(quote)) mapped.add("core");
      if (/\bchest\b/i.test(quote)) mapped.add("chest");
    }
    const add = (region: RegionId | null, suffix: string) => {
      results.push({
        id: `${start}:${end}:${suffix}`,
        region,
        quote,
        start,
        end,
        title: region
          ? regions.find((r) => r.id === region)!.name
          : "Body region needs review",
        detail: region
          ? "Reported observation · exact transcript excerpt"
          : correction
            ? "A correction or conflicting side was mentioned. Choose the intended region."
            : "The side or a supported body region is missing. Choose a location to place this note.",
        needsReview: true,
      });
    };
    for (const region of mapped) add(region, region);
    // Preserve unplaced mentions even when another region in the sentence is clear.
    const remainder = quote
      .replace(sided, "")
      .replace(
        /\b(calf raises?|hamstring curls?|knee extensions?|hip hinges?)\b/gi,
        "",
      )
      .replace(/\b(lower back|lumbar|core|abdominals?|chest)\b/gi, "");
    if (!mapped.size || anatomy.test(remainder)) add(null, "unplaced");
  }
  if (!results.length && transcript.trim()) {
    const quote = transcript.trim();
    const start = transcript.indexOf(quote);
    results.push({
      id: `${start}:${start + quote.length}:unplaced`,
      region: null,
      quote,
      start,
      end: start + quote.length,
      title: "Choose a body region",
      detail:
        "No supported body region was named. Keep this as a general note or place it yourself.",
      needsReview: true,
    });
  }
  return results;
}

// Coarse reference associations are for locating notes, not diagnosing a muscle.
export function muscleRegion(name: string): RegionId | null {
  const text = name.toLowerCase();
  const side = /\bleft\b/.test(text)
    ? "left"
    : /\bright\b/.test(text)
      ? "right"
      : null;
  if (side) {
    if (/biceps femoris|semitendinosus|semimembranosus/.test(text))
      return `${side}-hamstring`;
    if (/deltoid/.test(text)) return `${side}-shoulder`;
    if (/gastrocnemius|soleus/.test(text)) return `${side}-calf`;
    if (
      /tibialis|fibularis|peroneus|(?:extensor|flexor) (?:hallucis|digitorum) longus/.test(
        text,
      )
    )
      return `${side}-ankle`;
    if (/vastus|rectus femoris/.test(text)) return `${side}-knee`;
    if (/gluteus/.test(text)) return `${side}-hip`;
  }
  if (/pectoralis/.test(text)) return "chest";
  if (
    /rectus abdominis|external oblique|oblique (?:muscle )?of abdomen|transversus abdominis/.test(
      text,
    )
  )
    return "core";
  if (
    /iliocostalis lumborum|longissimus thoracis|multifidus|quadratus lumborum/.test(
      text,
    )
  )
    return "lower-back";
  return null;
}
export function loadAnnotationEdits(): {
  edits: AnnotationEdits;
  warning: string | null;
} {
  try {
    const raw = localStorage.getItem(annotationStorageKey);
    if (!raw) return { edits: {}, warning: null };
    const data: unknown = JSON.parse(raw);
    const object = (value: unknown): value is Record<string, unknown> =>
      !!value && typeof value === "object" && !Array.isArray(value);
    if (
      !object(data) ||
      !Object.values(data).every(
        (note) =>
          object(note) &&
          Object.values(note).every(
            (edit) =>
              object(edit) &&
              typeof edit.reviewed === "boolean" &&
              (edit.region === null ||
                regions.some((r) => r.id === edit.region)),
          ),
      )
    )
      throw new Error("Invalid annotations");
    return { edits: data as AnnotationEdits, warning: null };
  } catch {
    return {
      edits: {},
      warning:
        "Saved annotation edits could not be read. They have been left untouched; new edits cannot be saved until the stored record is repaired.",
    };
  }
}
export function saveAnnotationEdit(
  noteId: string,
  insightId: string,
  edit: AnnotationEdit,
) {
  const latest = loadAnnotationEdits();
  if (latest.warning) throw new Error(latest.warning);
  if (edit.region !== null && !regions.some((r) => r.id === edit.region))
    throw new Error("Unknown body region");
  const next = {
    ...latest.edits,
    [noteId]: { ...latest.edits[noteId], [insightId]: edit },
  };
  localStorage.setItem(annotationStorageKey, JSON.stringify(next));
  return next;
}
