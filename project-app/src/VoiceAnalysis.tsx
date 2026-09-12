import { Sparkles } from 'lucide-react';
import type { VoiceAnalysis as Analysis } from './voice-analysis';
import './voice-analysis.css';

export default function VoiceAnalysis({ analysis, showSummary = true }: { analysis: Analysis; showSummary?: boolean }) {
  return <section className="voice-analysis" aria-label="AI analysis of voice note">
    <div className="voice-analysis-heading"><Sparkles size={16} /><strong>AI analysis</strong><span>For review</span></div>
    {analysis.sources.some(source => source.source === 'sample') && <p className="voice-analysis-sample">Includes fictional sample notes; comparisons are demo context, not verified personal history.</p>}
    {showSummary && <p>{analysis.summary}</p>}
    {analysis.comparisons.length > 0 && <div>
      <h4>In context of earlier notes</h4>
      {analysis.comparisons.map((item, index) => <div className="voice-analysis-comparison" key={index}>
        <p>{item.observation}</p>
        <details><summary>View {item.sourceIds.length === 1 ? 'source note' : `${item.sourceIds.length} source notes`}</summary>
          {item.sourceIds.map(id => {
            const source = analysis.sources.find(candidate => candidate.id === id);
            return source ? <blockquote key={id}><small>{source.title} · {new Date(source.date).toLocaleDateString('en-IE')} · {source.source === 'sample' ? 'Sample context' : source.actor === 'physio' ? 'Physio note' : 'Reported note'}</small><p>{source.text}</p></blockquote> : null;
          })}
        </details>
      </div>)}
    </div>}
    {analysis.uncertainties.length > 0 && <div><h4>What remains uncertain</h4><ul>{analysis.uncertainties.map((text, index) => <li key={index}>{text}</li>)}</ul></div>}
    {analysis.questions.length > 0 && <div><h4>Questions for your next review</h4><ul>{analysis.questions.map((text, index) => <li key={index}>{text}</li>)}</ul></div>}
    <p className="voice-analysis-provenance">OpenAI · {analysis.sources.length} earlier {analysis.sources.length === 1 ? 'note' : 'notes'} considered{analysis.contextLimited ? ' · recent context is limited' : ''}. AI interpretation; your care plan stays unchanged.</p>
  </section>;
}
