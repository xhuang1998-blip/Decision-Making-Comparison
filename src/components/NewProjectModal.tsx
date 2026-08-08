import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Briefcase,
  Home,
  Car,
  Code,
  Layers,
  ArrowRight,
  Loader2,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { DECISION_TEMPLATES } from '../data/templates';
import { DecisionProject, DecisionTemplate } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: DecisionProject) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase className="w-5 h-5 text-blue-600" />,
  Home: <Home className="w-5 h-5 text-emerald-600" />,
  Car: <Car className="w-5 h-5 text-amber-600" />,
  Code: <Code className="w-5 h-5 text-violet-600" />,
};

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'ai' | 'blank'>('templates');
  const [aiTopic, setAiTopic] = useState('');
  const [aiContext, setAiContext] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Blank custom project state
  const [blankTitle, setBlankTitle] = useState('');
  const [blankDescription, setBlankDescription] = useState('');

  if (!isOpen) return null;

  const handleSelectTemplate = (template: DecisionTemplate) => {
    const newProject: DecisionProject = {
      id: `proj-${Date.now()}`,
      title: template.title,
      description: template.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scaleMin: 1,
      scaleMax: 10,
      weightMode: 'absolute',
      criteria: template.criteria.map((c, i) => ({
        ...c,
        id: `crit-${Date.now()}-${i}`,
      })),
      options: template.options.map((o, i) => ({
        ...o,
        id: `opt-${Date.now()}-${i}`,
      })),
    };

    onCreateProject(newProject);
    onClose();
  };

  const handleCreateBlank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blankTitle.trim()) return;

    const newProject: DecisionProject = {
      id: `proj-${Date.now()}`,
      title: blankTitle,
      description: blankDescription || 'Custom decision evaluation matrix',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scaleMin: 1,
      scaleMax: 10,
      weightMode: 'absolute',
      criteria: [
        { id: `crit-${Date.now()}-1`, name: 'Cost / Financial Impact', weight: 8, type: 'cost' },
        { id: `crit-${Date.now()}-2`, name: 'Quality & Value', weight: 9, type: 'benefit' },
        { id: `crit-${Date.now()}-3`, name: 'Ease of Implementation', weight: 7, type: 'benefit' },
      ],
      options: [
        { id: `opt-${Date.now()}-1`, name: 'Option A', scores: {}, color: '#2563EB' },
        { id: `opt-${Date.now()}-2`, name: 'Option B', scores: {}, color: '#059669' },
      ],
    };

    onCreateProject(newProject);
    onClose();
  };

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;

    setIsLoadingAI(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/suggest-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, context: aiContext }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate AI matrix structure');
      }

      const data = await res.json();

      // Map criteria and options to internal IDs
      const criteriaMap = new Map<string, string>();
      const criteria = (data.criteria || []).map((c: any, i: number) => {
        const id = `crit-${Date.now()}-${i}`;
        criteriaMap.set(c.name.toLowerCase(), id);
        return {
          id,
          name: c.name,
          description: c.description || '',
          weight: Math.min(10, Math.max(1, Number(c.weight) || 5)),
          type: (c.type === 'cost' ? 'cost' : 'benefit') as 'cost' | 'benefit',
        };
      });

      const options = (data.options || []).map((o: any, i: number) => {
        const id = `opt-${Date.now()}-${i}`;
        const scores: Record<string, number> = {};

        (o.scores || []).forEach((s: any) => {
          const critId = criteriaMap.get((s.criterionName || '').toLowerCase());
          if (critId) {
            scores[critId] = Math.min(10, Math.max(1, Number(s.score) || 5));
          }
        });

        // Ensure all criteria have a default score if missed
        criteria.forEach((c) => {
          if (scores[c.id] === undefined) {
            scores[c.id] = 5;
          }
        });

        return {
          id,
          name: o.name,
          description: o.description || '',
          scores,
          color: ['#2563EB', '#059669', '#D97706', '#7C3AED', '#DB2777'][i % 5],
        };
      });

      const newProject: DecisionProject = {
        id: `proj-${Date.now()}`,
        title: data.title || aiTopic,
        description: data.description || `AI generated decision framework for: ${aiTopic}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scaleMin: 1,
        scaleMax: 10,
        weightMode: 'absolute',
        criteria,
        options,
      };

      onCreateProject(newProject);
      onClose();
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'An unexpected error occurred while generating the matrix.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create New Decision Model</h2>
            <p className="text-xs text-slate-500">Choose a template or let Gemini AI generate custom evaluation criteria</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'templates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Decision Templates
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'ai'
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-200" />
            AI Assistant Generator
          </button>

          <button
            onClick={() => setActiveTab('blank')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'blank'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Blank Custom Matrix
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DECISION_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className="p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all cursor-pointer bg-white group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-blue-50 transition-colors">
                        {ICON_MAP[tmpl.iconName] || <Layers className="w-5 h-5 text-blue-600" />}
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {tmpl.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {tmpl.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{tmpl.criteria.length} Criteria • {tmpl.options.length} Options</span>
                    <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Load <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ai' && (
            <form onSubmit={handleGenerateAI} className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <p className="font-semibold">Gemini AI Decision Architect</p>
                  <p className="text-amber-700/90 mt-0.5">
                    Enter any complex decision topic (e.g. "Vendor selection for CRM software", "Choosing between graduate school or taking a job offer"). Gemini will craft tailored criteria, recommended weights, and options.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Decision Topic or Goal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Choosing a vacation destination for 4 friends with $2000 budget"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Constraints & Context (Optional)
                </label>

                <textarea
                  rows={3}
                  placeholder="e.g. Priorities are safety and beach access. Price is a major constraint. Options considering are Mexico, Costa Rica, or Florida."
                  value={aiContext}
                  onChange={(e) => setAiContext(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {aiError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                  {aiError}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoadingAI || !aiTopic.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {isLoadingAI ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Decision Model...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Custom Decision Matrix
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'blank' && (
            <form onSubmit={handleCreateBlank} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Decision Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Laptop Purchase Evaluation"
                  value={blankTitle}
                  onChange={(e) => setBlankTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Purpose
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of what you are choosing between and why."
                  value={blankDescription}
                  onChange={(e) => setBlankDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!blankTitle.trim()}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Create Blank Matrix
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
