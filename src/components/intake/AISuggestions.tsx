import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
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
  const { data, isLoading } = useAISuggestions(content, screenSlug, domain);

  if (content.length <= 20) {
    return (
      <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <Sparkles size={14} className="text-[#0F766E]" />
          <span>Type more to get AI-powered suggestions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-teal-50 border border-teal-100 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[#0F766E] text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} />
          <span>AI Suggestions</span>
        </div>
        {isLoading && <Loader2 size={14} className="text-[#0F766E] animate-spin" />}
      </div>

      <div className="flex flex-wrap gap-2">
        {data?.suggestions?.map((suggestion: string, i: number) => (
          <button
            key={i}
            onClick={() => onSelectSuggestion(suggestion)}
            className="text-left px-3 py-1.5 bg-white border border-teal-200 rounded-lg 
                       text-xs text-slate-700 hover:border-[#0F766E] hover:bg-teal-50 
                       transition-all shadow-sm"
          >
            + {suggestion}
          </button>
        ))}
        {!isLoading && (!data?.suggestions || data.suggestions.length === 0) && (
          <span className="text-xs text-slate-400">No suggestions yet. Keep typing!</span>
        )}
      </div>
    </div>
  );
};
