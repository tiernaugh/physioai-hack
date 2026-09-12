import { useMemo } from 'react';
import AgentDeepDive from './AgentDeepDive';
import { voiceDeepDive } from './voice-analysis';
import type { VoiceNote } from './voice-analysis';

export default function VoiceAnalysis({ note, compact = false, onDiscuss }: {
  note: VoiceNote; compact?: boolean; onDiscuss?: () => void;
}) {
  const analysis = useMemo(() => voiceDeepDive(note), [note]);
  return analysis ? <AgentDeepDive analysis={analysis} compact={compact} onDiscuss={onDiscuss} /> : null;
}
