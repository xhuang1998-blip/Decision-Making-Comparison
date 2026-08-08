import React, { useState } from 'react';
import {
  Sparkles,
  Loader2,
  FileText,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  ListChecks,
  RefreshCw,
  Printer,
  Download,
} from 'lucide-react';
import { DecisionProject, AIAnalysisResult } from '../types';
import { calculateResults } from '../utils/calculator';

interface AIExecutiveReportProps {
  project: DecisionProject;
  onUpdateProject: (updated: DecisionProject) => void;
}

export const AIExecutiveReport: React.FC<AIExecutiveReportProps> = ({
  project,
  onUpdateProject,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const results = calculateResults(
    project.criteria,
    project.options,
    project.scaleMin,
    project.scaleMax
  );

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const calculatedResults = results.map((r) => ({
        optionName: r.option.name,
        rank: r.rank,
        weightedTotal: r.weightedTotal,
        percentage: r.normalizedPercentage,
        isVetoed: r.isVetoed,
        vetoReasons: r.vetoReasons,
      }));

      const res = await fetch('/api/ai/analyze-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matrixData: {
            title: project.title,
            criteria: project.criteria.map((c) => ({
              name: c.name,
              weight: c.weight,
              type: c.type,
            })),
            calculatedResults,
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate AI executive report');
      }

      const aiData: AIAnalysisResult = await res.json();
      aiData.generatedAt = new Date().toLocaleString();

      onUpdateProject({
        ...project,
        updatedAt: new Date().toISOString(),
        aiAnalysis: aiData,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while analyzing the decision matrix.');
    } finally {
      setIsLoading(false);
    }
  };

  const aiAnalysis = project.aiAnalysis;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-100" />
            AI Executive Decision Synthesis
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gemini AI analyzes your matrix data, criteria weights, and trade-offs to deliver an executive summary
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Synthesizing Report...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              {aiAnalysis ? 'Regenerate Analysis' : 'Generate Executive Report'}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Report Content */}
      {!aiAnalysis && !isLoading && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Executive Report Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click the button above to generate a narrative synthesis of your decision matrix, identifying key trade-offs, sensitivity risks, and recommended action steps.
          </p>
        </div>
      )}

      {aiAnalysis && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 md:p-8 space-y-8">
          {/* Winner Rationale */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
              <Trophy className="w-5 h-5 text-emerald-600" />
              Recommended Choice: <span className="underline decoration-emerald-400">{aiAnalysis.winner}</span>
            </div>
            <p className="text-sm text-emerald-900/90 leading-relaxed font-normal">
              {aiAnalysis.summary}
            </p>
          </div>

          {/* Grid of Key Analysis Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Trade-offs */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> Key Trade-Offs Evaluated
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {aiAnalysis.keyTradeoffs.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hidden Risks & Caveats */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Hidden Risks & Qualitative Caveats
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {aiAnalysis.risksAndCaveats.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Next Steps */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-blue-600" /> Recommended Actionable Next Steps
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aiAnalysis.nextSteps.map((step, i) => (
                <div key={i} className="p-3 bg-white border border-blue-100 rounded-lg text-xs text-slate-800 font-medium flex items-center gap-2 shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Generated at: {aiAnalysis.generatedAt || 'Just now'}</span>
            <span>Powered by Gemini 3.6 Flash</span>
          </div>
        </div>
      )}
    </div>
  );
};
