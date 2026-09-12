import { deriveVoiceInsights, muscleRegion } from './voice-annotations.ts';
import type { RegionId } from './data';

export type AnalysisRegion = RegionId | 'left-elbow' | 'right-elbow' | 'left-wrist' | 'right-wrist' | 'neck';
export type LocatedArea = { region: AnalysisRegion; label: string; quote: string };
export type Bounds = [[number, number, number], [number, number, number]];

export function analysisMuscleRegion(name: string): AnalysisRegion | null {
  const side = /\bleft\b/i.test(name) ? 'left' : /\bright\b/i.test(name) ? 'right' : null;
  if (side && /anconeus/i.test(name)) return `${side}-elbow`;
  if (side && /pronator quadratus/i.test(name)) return `${side}-wrist`;
  if (/sternocleidomastoid|splenius capitis/i.test(name)) return 'neck';
  return muscleRegion(name);
}
export const regionLabel = (region: AnalysisRegion) => region.replace(/-/g, ' ').replace(/^./, letter => letter.toUpperCase());
export const regionPosterior = (region?: AnalysisRegion) => !!region && /hamstring|calf|hip|lower-back|elbow/.test(region);

// An index of explicit source wording. Never borrow a side or a body region from
// an earlier note or generated analysis. Negation stays visible in the quote.
export function locateAnalysisAreas(transcript: string): { areas: LocatedArea[]; unplaced: string[] } {
  const grouped = new Map<AnalysisRegion, LocatedArea>();
  const unplaced = new Set<string>();
  for (const insight of deriveVoiceInsights(transcript)) {
    if (insight.region) {
      const existing = grouped.get(insight.region);
      if (existing && !existing.quote.includes(insight.quote)) existing.quote += `\n${insight.quote}`;
      else if (!existing) grouped.set(insight.region, { region: insight.region, label: insight.title, quote: insight.quote });
    } else {
      const corrected = /\b(actually|instead|correction|meant|not (?:my |the )?(?:left|right)|rather than)\b/i.test(insight.quote);
      let remainder = insight.quote;
      if (!corrected) {
        remainder = remainder.replace(/\b(left|right|both)\s+(elbows?|wrists?)\b/gi, (_, side: string, part: string) => {
          for (const value of side.toLowerCase() === 'both' ? ['left', 'right'] : [side.toLowerCase()]) {
            const region = `${value}-${part.toLowerCase().replace(/s$/, '')}` as AnalysisRegion;
            grouped.set(region, { region, label: regionLabel(region), quote: insight.quote });
          }
          return '';
        });
        if (/\bneck\b/i.test(remainder)) {
          grouped.set('neck', { region: 'neck', label: 'Neck', quote: insight.quote });
          remainder = remainder.replace(/\bneck\b/gi, '');
        }
      }
      remainder = remainder.replace(/\b(left|right|both)\s+(hamstrings?|shoulders?|knees?|hips?|calf|calves|ankles?)\b/gi, '')
        .replace(/\b(lower back|lumbar|core|abdominals?|chest)\b/gi, '');
      if (corrected || /\b(shoulders?|hamstrings?|knees?|hips?|calf|calves|ankles?|elbows?|wrists?|thighs?|back|legs?|arms?)\b/i.test(remainder)) unplaced.add(insight.quote);
    }
  }
  return { areas: [...grouped.values()], unplaced: [...unplaced] };
}

export function regionAnchor(region: AnalysisRegion, bounds: Bounds): [number, number, number] {
  const [min, max] = bounds;
  const point: [number, number, number] = min.map((value, index) => (value + max[index]) / 2) as [number, number, number];
  if (region.endsWith('ankle')) point[1] = min[1] + (max[1] - min[1]) * .12;
  if (region.endsWith('knee')) point[1] = min[1] + (max[1] - min[1]) * .16;
  point[2] = regionPosterior(region) ? min[2] - .012 : max[2] + .012;
  return point;
}
