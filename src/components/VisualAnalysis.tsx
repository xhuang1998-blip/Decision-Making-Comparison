import React, { useState, useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
} from 'recharts';
import {
  Trophy,
  SlidersHorizontal,
  BarChart2,
  PieChart as PieChartIcon,
  Crosshair,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Criterion, DecisionProject, Option } from '../types';
import { calculateResults, getNormalizedScore } from '../utils/calculator';

interface VisualAnalysisProps {
  project: DecisionProject;
  onUpdateProject: (updated: DecisionProject) => void;
}

export const VisualAnalysis: React.FC<VisualAnalysisProps> = ({
  project,
  onUpdateProject,
}) => {
  // Sensitivity state: temporary copy of criteria weights for live "What-If" testing
  const [tempWeights, setTempWeights] = useState<Record<string, number>>(() => {
    const weights: Record<string, number> = {};
    project.criteria.forEach((c) => {
      weights[c.id] = c.weight;
    });
    return weights;
  });

  // Selected options to display on Radar Chart
  const [visibleOptionIds, setVisibleOptionIds] = useState<string[]>(() =>
    project.options.map((o) => o.id)
  );

  // Head-to-head comparison state
  const [h2hOptA, setH2hOptA] = useState<string>(project.options[0]?.id || '');
  const [h2hOptB, setH2hOptB] = useState<string>(project.options[1]?.id || project.options[0]?.id || '');

  // Base calculated results
  const baseResults = useMemo(
    () =>
      calculateResults(
        project.criteria,
        project.options,
        project.scaleMin,
        project.scaleMax
      ),
    [project]
  );

  // Simulated results with tempWeights
  const simCriteria = useMemo(
    () =>
      project.criteria.map((c) => ({
        ...c,
        weight: tempWeights[c.id] ?? c.weight,
      })),
    [project.criteria, tempWeights]
  );

  const simResults = useMemo(
    () =>
      calculateResults(
        simCriteria,
        project.options,
        project.scaleMin,
        project.scaleMax
      ),
    [simCriteria, project]
  );

  const winner = simResults[0];
  const runnerUp = simResults[1];
  const scoreGap =
    winner && runnerUp
      ? (winner.normalizedPercentage - runnerUp.normalizedPercentage).toFixed(1)
      : '0';

  // Format Radar Data
  const radarData = useMemo(() => {
    return project.criteria.map((crit) => {
      const row: Record<string, any> = {
        criterion: crit.name,
      };

      project.options.forEach((opt) => {
        if (visibleOptionIds.includes(opt.id)) {
          const rawScore = opt.scores[crit.id] ?? 5;
          const normScore = getNormalizedScore(
            rawScore,
            crit.type,
            project.scaleMin,
            project.scaleMax
          );
          row[opt.name] = normScore;
        }
      });

      return row;
    });
  }, [project, visibleOptionIds]);

  // Format Stacked Bar Data
  const stackedBarData = useMemo(() => {
    return simResults.map((res) => {
      const row: Record<string, any> = {
        name: res.option.name,
        total: res.weightedTotal,
      };

      project.criteria.forEach((crit) => {
        row[crit.name] = res.criterionWeightedScores[crit.id] || 0;
      });

      return row;
    });
  }, [simResults, project.criteria]);

  // Format Scatter Plot Data (Benefit Score vs Cost Score)
  const scatterData = useMemo(() => {
    const benefitCriteria = project.criteria.filter((c) => c.type === 'benefit');
    const costCriteria = project.criteria.filter((c) => c.type === 'cost');

    return simResults.map((res) => {
      let benefitSum = 0;
      let costSum = 0;

      benefitCriteria.forEach((c) => {
        benefitSum += res.criterionWeightedScores[c.id] || 0;
      });

      costCriteria.forEach((c) => {
        // High normalized cost score = lower cost overhead
        costSum += res.criterionWeightedScores[c.id] || 0;
      });

      return {
        id: res.option.id,
        name: res.option.name,
        benefitScore: Number(benefitSum.toFixed(1)),
        costScore: Number(costSum.toFixed(1)),
        totalScore: res.weightedTotal,
        percentage: res.normalizedPercentage,
        color: res.option.color || '#2563EB',
      };
    });
  }, [simResults, project.criteria]);

  // Apply sensitivity weights permanently to project
  const handleApplySimulatedWeights = () => {
    const updatedCriteria = project.criteria.map((c) => ({
      ...c,
      weight: tempWeights[c.id] ?? c.weight,
    }));

    onUpdateProject({
      ...project,
      updatedAt: new Date().toISOString(),
      criteria: updatedCriteria,
    });
  };

  const handleResetSimulatedWeights = () => {
    const weights: Record<string, number> = {};
    project.criteria.forEach((c) => {
      weights[c.id] = c.weight;
    });
    setTempWeights(weights);
  };

  const toggleOptionVisibility = (id: string) => {
    if (visibleOptionIds.includes(id)) {
      if (visibleOptionIds.length <= 1) return; // Keep at least 1
      setVisibleOptionIds(visibleOptionIds.filter((item) => item !== id));
    } else {
      setVisibleOptionIds([...visibleOptionIds, id]);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Winner Card & Ranking Summary */}
      {winner && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Winner Showcase Card */}
          <div className="lg:col-span-1 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
                  <Trophy className="w-4 h-4 text-amber-300" /> Winner Option
                </span>
                <span className="text-2xl font-black text-amber-300">
                  {winner.normalizedPercentage}%
                </span>
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight leading-snug">
                {winner.option.name}
              </h2>
              {winner.option.description && (
                <p className="text-xs text-emerald-100 mt-1 line-clamp-2">
                  {winner.option.description}
                </p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-500/40 text-xs text-emerald-100 space-y-1.5">
              <div className="flex justify-between">
                <span>Weighted Score:</span>
                <strong className="text-white font-bold">{winner.weightedTotal.toFixed(1)} pts</strong>
              </div>
              {runnerUp && (
                <div className="flex justify-between">
                  <span>Margin Over #2 ({runnerUp.option.name}):</span>
                  <strong className="text-amber-200 font-bold">+{scoreGap}%</strong>
                </div>
              )}
            </div>
          </div>

          {/* All Options Ranked List */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" /> Option Leaderboard
                </span>
                <span className="text-xs font-normal text-slate-500">
                  Sorted by Total Score
                </span>
              </h3>

              <div className="space-y-3">
                {simResults.map((res) => (
                  <div
                    key={res.option.id}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          res.rank === 1
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        #{res.rank}
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: res.option.color || '#2563EB' }}
                          ></span>
                          {res.option.name}
                        </div>
                        <div className="w-32 sm:w-48 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${res.normalizedPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-slate-900 text-sm">
                        {res.weightedTotal.toFixed(1)} pts
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold">
                        {res.normalizedPercentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Sensitivity Simulator ("What-If" Weights Testing) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-amber-600" />
              Sensitivity Analysis ("What-If" Weight Simulator)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag weights below to see how shifts in priority instantly alter option rankings
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetSimulatedWeights}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Weights
            </button>
            <button
              onClick={handleApplySimulatedWeights}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Save Weights to Matrix
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.criteria.map((crit) => {
            const currentWeight = tempWeights[crit.id] ?? crit.weight;
            return (
              <div
                key={crit.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-900 truncate">{crit.name}</span>
                  <span className="text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
                    Weight: {currentWeight}
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={currentWeight}
                  onChange={(e) =>
                    setTempWeights({
                      ...tempWeights,
                      [crit.id]: Number(e.target.value),
                    })
                  }
                  className="w-full accent-amber-600 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Radar Comparison & Stacked Bar Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-violet-600" />
                Multi-Axial Radar Comparison
              </h3>
              <span className="text-xs text-slate-500">Normalized 1-10 Scores</span>
            </div>

            {/* Option Toggles */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-medium text-slate-500">Show on Radar:</span>
              {project.options.map((opt) => {
                const isChecked = visibleOptionIds.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleOptionVisibility(opt.id)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isChecked
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: opt.color || '#2563EB' }}
                    ></span>
                    {opt.name}
                  </button>
                );
              })}
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="criterion" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, project.scaleMax]} stroke="#cbd5e1" />
                  {project.options
                    .filter((opt) => visibleOptionIds.includes(opt.id))
                    .map((opt) => (
                      <Radar
                        key={opt.id}
                        name={opt.name}
                        dataKey={opt.name}
                        stroke={opt.color || '#2563EB'}
                        fill={opt.color || '#2563EB'}
                        fillOpacity={0.2}
                      />
                    ))}
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Stacked Contribution Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                Score Contribution Breakdown
              </h3>
              <span className="text-xs text-slate-500">Weighted Points</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stackedBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  {project.criteria.map((crit, index) => {
                    const colors = [
                      '#2563EB',
                      '#10B981',
                      '#F59E0B',
                      '#8B5CF6',
                      '#EC4899',
                      '#06B6D4',
                      '#E11D48',
                    ];
                    return (
                      <Bar
                        key={crit.id}
                        dataKey={crit.name}
                        stackId="a"
                        fill={colors[index % colors.length]}
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Benefit vs Cost Scatter Matrix & Head-to-Head Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Benefit vs Cost Scatter Quadrant Plot */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-emerald-600" />
              Benefit vs. Cost Satisfaction Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Top-right quadrant represents optimal choices (high benefit points and low cost overhead)
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="benefitScore"
                  name="Benefit Score"
                  unit=" pts"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Benefit Points →', position: 'bottom', fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="costScore"
                  name="Cost Satisfaction"
                  unit=" pts"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Cost Score ↑', angle: -90, position: 'left', fontSize: 11 }}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Options" data={scatterData} fill="#2563EB" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Head-to-Head Battle Arena */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Head-to-Head Pairwise Comparison
            </h3>

            {/* Option Pickers */}
            <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Option A
                </label>
                <select
                  value={h2hOptA}
                  onChange={(e) => setH2hOptA(e.target.value)}
                  className="w-full text-xs font-bold p-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                >
                  {project.options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Option B
                </label>
                <select
                  value={h2hOptB}
                  onChange={(e) => setH2hOptB(e.target.value)}
                  className="w-full text-xs font-bold p-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                >
                  {project.options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Battle Matrix */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {project.criteria.map((crit) => {
                const optA = project.options.find((o) => o.id === h2hOptA);
                const optB = project.options.find((o) => o.id === h2hOptB);
                const scoreA = optA?.scores[crit.id] ?? 5;
                const scoreB = optB?.scores[crit.id] ?? 5;
                const normA = getNormalizedScore(scoreA, crit.type, project.scaleMin, project.scaleMax);
                const normB = getNormalizedScore(scoreB, crit.type, project.scaleMin, project.scaleMax);
                const diff = normA - normB;

                return (
                  <div
                    key={crit.id}
                    className="p-2 bg-slate-50 rounded-lg text-xs flex items-center justify-between gap-2"
                  >
                    <span className="font-semibold text-slate-800 truncate w-1/3">
                      {crit.name}
                    </span>

                    <div className="flex items-center gap-3 font-bold">
                      <span className={diff > 0 ? 'text-emerald-600' : 'text-slate-700'}>
                        {normA}
                      </span>
                      <span className="text-slate-400 font-normal">vs</span>
                      <span className={diff < 0 ? 'text-emerald-600' : 'text-slate-700'}>
                        {normB}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        diff > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : diff < 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {diff > 0 ? 'A + ' + diff : diff < 0 ? 'B + ' + Math.abs(diff) : 'Tie'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
