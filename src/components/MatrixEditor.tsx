import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Sliders,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Check,
  Edit2,
  X,
  Palette,
} from 'lucide-react';
import { Criterion, DecisionProject, Option } from '../types';
import { calculateResults, OPTION_COLORS } from '../utils/calculator';

interface MatrixEditorProps {
  project: DecisionProject;
  onUpdateProject: (updated: DecisionProject) => void;
  onSwitchToAnalytics: () => void;
}

export const MatrixEditor: React.FC<MatrixEditorProps> = ({
  project,
  onUpdateProject,
  onSwitchToAnalytics,
}) => {
  const [editingNoteCell, setEditingNoteCell] = useState<{
    optionId: string;
    criterionId: string;
  } | null>(null);

  const [activeNoteText, setActiveNoteText] = useState('');

  // Add new criterion state
  const [isAddingCriterion, setIsAddingCriterion] = useState(false);
  const [newCritName, setNewCritName] = useState('');
  const [newCritWeight, setNewCritWeight] = useState(8);
  const [newCritType, setNewCritType] = useState<'benefit' | 'cost'>('benefit');
  const [newCritDesc, setNewCritDesc] = useState('');
  const [newCritThreshold, setNewCritThreshold] = useState<number | undefined>(undefined);

  // Add new option state
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptName, setNewOptName] = useState('');
  const [newOptDesc, setNewOptDesc] = useState('');

  const results = calculateResults(
    project.criteria,
    project.options,
    project.scaleMin,
    project.scaleMax
  );
  const topResult = results[0];

  // Helper updates
  const handleScoreChange = (optionId: string, criterionId: string, value: number) => {
    const val = Math.min(project.scaleMax, Math.max(project.scaleMin, value));
    const updatedOptions = project.options.map((opt) => {
      if (opt.id === optionId) {
        return {
          ...opt,
          scores: {
            ...opt.scores,
            [criterionId]: val,
          },
        };
      }
      return opt;
    });

    onUpdateProject({
      ...project,
      updatedAt: new Date().toISOString(),
      options: updatedOptions,
    });
  };

  const handleSaveNote = (optionId: string, criterionId: string) => {
    const updatedOptions = project.options.map((opt) => {
      if (opt.id === optionId) {
        const notes = { ...(opt.notes || {}) };
        if (activeNoteText.trim()) {
          notes[criterionId] = activeNoteText.trim();
        } else {
          delete notes[criterionId];
        }
        return { ...opt, notes };
      }
      return opt;
    });

    onUpdateProject({
      ...project,
      updatedAt: new Date().toISOString(),
      options: updatedOptions,
    });
    setEditingNoteCell(null);
  };

  const handleCriterionWeightChange = (criterionId: string, weight: number) => {
    const updatedCriteria = project.criteria.map((c) =>
      c.id === criterionId ? { ...c, weight } : c
    );
    onUpdateProject({
      ...project,
      updatedAt: new Date().toISOString(),
      criteria: updatedCriteria,
    });
  };

  const handleToggleCriterionType = (criterionId: string) => {
    const updatedCriteria = project.criteria.map((c) =>
      c.id === criterionId
        ? { ...c, type: (c.type === 'benefit' ? 'cost' : 'benefit') as 'benefit' | 'cost' }
        : c
    );
    onUpdateProject({
      ...project,
      updatedAt: new Date().toISOString(),
      criteria: updatedCriteria,
    });
  };

  const handleRemoveCriterion = (criterionId: string) => {
    if (project.criteria.length <= 1) {
      alert('A decision matrix requires at least 1 evaluation criterion.');
      return;
    }
    const updatedCriteria = project.criteria.filter((c) => c.id !== criterionId);
    onUpdateProject({
      ...project,
      updatedAt: new Date().toISOString(),
      criteria: updatedCriteria,
    });
  };

  const handleRemoveOption = (optionId: string) => {
    if (project.options.length <= 1) {
      alert('A decision matrix requires at least 1 option.');
      return;
    }
    const updatedOptions = project.options.filter((o) => o.id !== optionId);
    onUpdateProject({
      ...project,
      updatedAt: new Date().toISOString(),
      options: updatedOptions,
    });
  };

  const handleAddCriterionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCritName.trim()) return;

    const newCrit: Criterion = {
      id: `crit-${Date.now()}`,
      name: newCritName.trim(),
      description: newCritDesc.trim() || undefined,
      weight: newCritWeight,
      type: newCritType,
      minThreshold: newCritThreshold && newCritThreshold > 0 ? newCritThreshold : undefined,
    };

    onUpdateProject({
      ...project,
      updatedAt: new Date().toISOString(),
      criteria: [...project.criteria, newCrit],
    });

    setNewCritName('');
    setNewCritDesc('');
    setNewCritWeight(8);
    setNewCritType('benefit');
    setNewCritThreshold(undefined);
    setIsAddingCriterion(false);
  };

  const handleAddOptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptName.trim()) return;

    const defaultScores: Record<string, number> = {};
    project.criteria.forEach((c) => {
      defaultScores[c.id] = Math.round((project.scaleMin + project.scaleMax) / 2);
    });

    const newOpt: Option = {
      id: `opt-${Date.now()}`,
      name: newOptName.trim(),
      description: newOptDesc.trim() || undefined,
      scores: defaultScores,
      color: OPTION_COLORS[project.options.length % OPTION_COLORS.length],
    };

    onUpdateProject({
      ...project,
      updatedAt: new Date().toISOString(),
      options: [...project.options, newOpt],
    });

    setNewOptName('');
    setNewOptDesc('');
    setIsAddingOption(false);
  };

  const handleEqualizeWeights = () => {
    const updatedCriteria = project.criteria.map((c) => ({ ...c, weight: 5 }));
    onUpdateProject({
      ...project,
      updatedAt: new Date().toISOString(),
      criteria: updatedCriteria,
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title & Leader Summary Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{project.title}</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            {project.description}
          </p>
        </div>

        {/* Current Winner Snapshot */}
        {topResult && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
              #{topResult.rank}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Leading Option
              </div>
              <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{topResult.option.name}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {topResult.normalizedPercentage}% Score
                </span>
              </div>
            </div>
            <button
              onClick={onSwitchToAnalytics}
              className="ml-2 text-xs font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 cursor-pointer"
            >
              View Analytics &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Main Grid Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-bold text-slate-800">
              Interactive Scoring Matrix
            </span>
            <span className="text-xs text-slate-500">
              ({project.criteria.length} Criteria x {project.options.length} Options)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEqualizeWeights}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Set all weights to equal (5)"
            >
              Equalize Weights
            </button>
            <button
              onClick={() => setIsAddingCriterion(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-200/70 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Criterion
            </button>
            <button
              onClick={() => setIsAddingOption(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Option
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 text-xs font-semibold border-b border-slate-200">
                {/* Criteria Column Header */}
                <th className="p-4 min-w-[280px] sm:min-w-[320px] bg-slate-100/80 sticky left-0 z-10 border-r border-slate-200">
                  Evaluation Criteria & Weights
                </th>

                {/* Options Header Columns */}
                {results.map((res) => (
                  <th
                    key={res.option.id}
                    className="p-4 min-w-[180px] max-w-[240px] text-center border-r border-slate-200 relative group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="w-3 h-3 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: res.option.color || '#2563EB' }}
                      ></span>

                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          res.rank === 1
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Rank #{res.rank}
                      </span>

                      <button
                        onClick={() => handleRemoveOption(res.option.id)}
                        className="text-slate-400 hover:text-red-600 p-0.5 rounded-sm transition-colors cursor-pointer"
                        title="Delete Option"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="font-bold text-sm text-slate-900 truncate">
                      {res.option.name}
                    </div>

                    {res.option.description && (
                      <div className="text-[11px] font-normal text-slate-500 line-clamp-1 mt-0.5">
                        {res.option.description}
                      </div>
                    )}

                    {/* Quick Total Bar */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[10px]">Total Score:</span>
                      <span className="font-extrabold text-slate-900">
                        {res.weightedTotal.toFixed(1)} pts ({res.normalizedPercentage}%)
                      </span>
                    </div>

                    {res.isVetoed && (
                      <div className="mt-1 text-[10px] font-bold text-red-600 bg-red-50 p-1 rounded-sm border border-red-200 flex items-center gap-1 justify-center">
                        <AlertTriangle className="w-3 h-3" />
                        Threshold Vetoed
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-sm">
              {project.criteria.map((crit) => (
                <tr key={crit.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Left Criterion Cell */}
                  <td className="p-4 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {crit.name}
                          </span>

                          {/* Type Badge */}
                          <button
                            onClick={() => handleToggleCriterionType(crit.id)}
                            title={`Click to switch to ${crit.type === 'benefit' ? 'Cost' : 'Benefit'}`}
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md cursor-pointer transition-colors ${
                              crit.type === 'benefit'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                            }`}
                          >
                            {crit.type === 'benefit' ? (
                              <>
                                <ArrowUpRight className="w-3 h-3" /> Benefit
                              </>
                            ) : (
                              <>
                                <ArrowDownRight className="w-3 h-3" /> Cost
                              </>
                            )}
                          </button>
                        </div>

                        {crit.description && (
                          <p className="text-xs text-slate-500 leading-tight">
                            {crit.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleRemoveCriterion(crit.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors shrink-0 cursor-pointer"
                        title="Delete Criterion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Weight Slider */}
                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-600 shrink-0">
                        Weight: <strong className="text-slate-900">{crit.weight}</strong>/10
                      </span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={crit.weight}
                        onChange={(e) =>
                          handleCriterionWeightChange(crit.id, Number(e.target.value))
                        }
                        className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                      />
                    </div>
                  </td>

                  {/* Option Score Cells */}
                  {project.options.map((opt) => {
                    const rawScore = opt.scores[crit.id] ?? 5;
                    const cellNote = opt.notes?.[crit.id];
                    const isNoteEditing =
                      editingNoteCell?.optionId === opt.id &&
                      editingNoteCell?.criterionId === crit.id;

                    // Calculate max score highlight for this criterion
                    const maxScoreForCrit = Math.max(
                      ...project.options.map((o) => o.scores[crit.id] ?? 5)
                    );
                    const isBestInCrit = rawScore === maxScoreForCrit && project.options.length > 1;

                    return (
                      <td
                        key={opt.id}
                        className={`p-3 text-center border-r border-slate-200 align-top transition-colors relative ${
                          isBestInCrit ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          {/* Score Selector (1 - 10) */}
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={project.scaleMin}
                              max={project.scaleMax}
                              value={rawScore}
                              onChange={(e) =>
                                handleScoreChange(opt.id, crit.id, Number(e.target.value))
                              }
                              className="w-14 text-center font-bold text-sm py-1 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                            />
                            <span className="text-xs text-slate-400">/{project.scaleMax}</span>
                          </div>

                          {/* Mini Slider */}
                          <input
                            type="range"
                            min={project.scaleMin}
                            max={project.scaleMax}
                            value={rawScore}
                            onChange={(e) =>
                              handleScoreChange(opt.id, crit.id, Number(e.target.value))
                            }
                            className="w-24 h-1 accent-blue-600 bg-slate-200 rounded-lg cursor-pointer"
                          />

                          {/* Calculated weighted contribution */}
                          <div className="text-[11px] font-medium text-slate-500">
                            {crit.type === 'cost' ? (
                              <span className="text-orange-700">
                                Norm: {project.scaleMax + project.scaleMin - rawScore} (Wt:{' '}
                                {(
                                  (project.scaleMax + project.scaleMin - rawScore) *
                                  crit.weight
                                ).toFixed(0)}
                                )
                              </span>
                            ) : (
                              <span className="text-slate-600">
                                Wt Score: {(rawScore * crit.weight).toFixed(0)}
                              </span>
                            )}
                          </div>

                          {/* Note Button / Display */}
                          {cellNote && !isNoteEditing && (
                            <div
                              onClick={() => {
                                setEditingNoteCell({ optionId: opt.id, criterionId: crit.id });
                                setActiveNoteText(cellNote);
                              }}
                              className="mt-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md max-w-[150px] truncate cursor-pointer transition-colors"
                              title={cellNote}
                            >
                              💬 {cellNote}
                            </div>
                          )}

                          {!cellNote && !isNoteEditing && (
                            <button
                              onClick={() => {
                                setEditingNoteCell({ optionId: opt.id, criterionId: crit.id });
                                setActiveNoteText('');
                              }}
                              className="mt-0.5 text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" /> Note
                            </button>
                          )}

                          {/* Inline Note Editor */}
                          {isNoteEditing && (
                            <div className="mt-1 w-full bg-white p-2 border border-slate-300 rounded-lg shadow-md z-20 space-y-1">
                              <textarea
                                rows={2}
                                autoFocus
                                value={activeNoteText}
                                onChange={(e) => setActiveNoteText(e.target.value)}
                                placeholder="Add note or metrics..."
                                className="w-full text-xs p-1.5 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                              />
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => setEditingNoteCell(null)}
                                  className="px-1.5 py-0.5 text-[10px] text-slate-500 hover:text-slate-800"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveNote(opt.id, crit.id)}
                                  className="px-2 py-0.5 text-[10px] font-semibold text-white bg-blue-600 rounded-md"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals for Adding Criteria & Options */}
      {isAddingCriterion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Add New Criterion</h3>
              <button
                onClick={() => setIsAddingCriterion(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCriterionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Criterion Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Maintenance Cost"
                  value={newCritName}
                  onChange={(e) => setNewCritName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCritType('benefit')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer ${
                      newCritType === 'benefit'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" /> Benefit (Higher = Better)
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewCritType('cost')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer ${
                      newCritType === 'cost'
                        ? 'bg-orange-50 text-orange-700 border-orange-300 ring-2 ring-orange-500/20'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" /> Cost (Lower = Better)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Importance Weight (1 to 10): <strong>{newCritWeight}</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newCritWeight}
                  onChange={(e) => setNewCritWeight(Number(e.target.value))}
                  className="w-full accent-blue-600 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Guidance (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Expected annual upkeep costs"
                  value={newCritDesc}
                  onChange={(e) => setNewCritDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCriterion(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newCritName.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs cursor-pointer"
                >
                  Add Criterion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddingOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Add New Option</h3>
              <button
                onClick={() => setIsAddingOption(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOptionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Option Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Company Option C"
                  value={newOptName}
                  onChange={(e) => setNewOptName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Startup with remote flexibility"
                  value={newOptDesc}
                  onChange={(e) => setNewOptDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingOption(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newOptName.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs cursor-pointer"
                >
                  Add Option
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
