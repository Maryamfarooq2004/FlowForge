import React from 'react';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { useAISuggestions } from '../../hooks/useIntake';

interface AISuggestionsProps {
  content: string;
  screenSlug: string;
  domain: string;
  onSelectSuggestion: (suggestion: string) => void;
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({
  content,
  screenSlug,
  domain,
  onSelectSuggestion,
}) => {
  const suggest = useAISuggestions();
  const hasContent = content.trim().length > 0;
  const suggestions = suggest.data ?? [];

  return (
    <div className="mt-4 p-4 bg-teal-50 border border-teal-100 rounded-xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-[#0F766E] text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} />
          <span>AI Suggestions</span>
        </div>
        <button
          type="button"
          onClick={() => suggest.mutate({ content, screenSlug, domain })}
          disabled={suggest.isPending}
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0F766E]
                     hover:bg-[#0D6B63] disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors"
        >
          {suggest.isPending ? (
            <><Loader2 size={13} className="animate-spin" /> Thinking…</>
          ) : (
            <><Sparkles size={13} /> {hasContent ? 'Improve what I wrote' : 'What should I write here?'}</>
          )}
        </button>
      </div>

      {suggest.isError && (
        <p className="text-[11px] text-red-500 mt-3">
          Couldn't reach the AI right now — please try again.
        </p>
      )}

      {!suggest.isPending && !suggest.isError && suggest.isIdle && (
        <p className="text-[11px] text-slate-500 mt-3">
          {hasContent
            ? 'Click above and the AI will suggest additions based on what you wrote.'
            : 'Not sure what to write? Click above for 4–5 prompts tailored to this screen.'}
        </p>
      )}

      {suggestions.length > 0 && (
        <ul className="mt-3 space-y-2">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => onSelectSuggestion(s)}
                className="w-full text-left flex items-start gap-2 px-3 py-2 bg-white border border-teal-200
                           rounded-lg text-xs text-slate-700 hover:border-[#0F766E] hover:bg-teal-50
                           transition-all shadow-sm"
              >
                <Plus size={13} className="text-[#0F766E] shrink-0 mt-0.5" />
                <span>{s}</span>
              </button>
            </li>
          ))}
          <li className="text-[10px] text-slate-400 pl-1">Click any suggestion to add it to your answer.</li>
        </ul>
      )}
    </div>
  );
};
