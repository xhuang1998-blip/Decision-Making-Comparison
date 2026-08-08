import { Criterion, Option, CalculatedOptionResult, DecisionProject } from '../types';

export const OPTION_COLORS = [
  '#2563EB', // Royal Blue
  '#059669', // Emerald
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#DB2777', // Pink
  '#0891B2', // Cyan
  '#DC2626', // Red
  '#4D7C0F', // Lime
];

/**
 * Normalizes raw score based on Criterion Type (Benefit vs Cost)
 */
export function getNormalizedScore(
  rawScore: number,
  type: 'benefit' | 'cost',
  scaleMin: number = 1,
  scaleMax: number = 10
): number {
  if (type === 'cost') {
    // Invert score: Low raw cost = High normalized satisfaction score
    return scaleMax + scaleMin - rawScore;
  }
  return rawScore;
}

/**
 * Calculates weighted scores, percentages, ranks, and veto status for options
 */
export function calculateResults(
  criteria: Criterion[],
  options: Option[],
  scaleMin: number = 1,
  scaleMax: number = 10
): CalculatedOptionResult[] {
  if (!criteria.length || !options.length) return [];

  // Total weight sum for percentage calculations if needed
  const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);

  const maxPossibleWeightedTotal = criteria.reduce((sum, c) => {
    return sum + scaleMax * (c.weight || 0);
  }, 0);

  const results: CalculatedOptionResult[] = options.map((opt) => {
    let weightedTotal = 0;
    let rawTotal = 0;
    const criterionWeightedScores: Record<string, number> = {};
    const criterionNormalizedScores: Record<string, number> = {};
    const vetoReasons: string[] = [];

    criteria.forEach((c) => {
      const rawScore = opt.scores[c.id] ?? scaleMin;
      rawTotal += rawScore;

      const normScore = getNormalizedScore(rawScore, c.type, scaleMin, scaleMax);
      criterionNormalizedScores[c.id] = normScore;

      const weightedScore = normScore * (c.weight || 0);
      criterionWeightedScores[c.id] = weightedScore;
      weightedTotal += weightedScore;

      // Check veto threshold
      if (c.minThreshold !== undefined && c.minThreshold !== null && c.minThreshold > 0) {
        if (normScore < c.minThreshold) {
          vetoReasons.push(
            `Failed threshold for "${c.name}" (Score: ${rawScore}, Min required norm score: ${c.minThreshold})`
          );
        }
      }
    });

    const normalizedPercentage =
      maxPossibleWeightedTotal > 0
        ? Math.min(100, Math.max(0, (weightedTotal / maxPossibleWeightedTotal) * 100))
        : 0;

    return {
      option: opt,
      rawTotal,
      weightedTotal,
      maxPossibleWeightedTotal,
      normalizedPercentage: Number(normalizedPercentage.toFixed(1)),
      rank: 0, // Assigned next
      criterionWeightedScores,
      criterionNormalizedScores,
      isVetoed: vetoReasons.length > 0,
      vetoReasons,
    };
  });

  // Sort by weighted total descending, putting non-vetoed ahead of vetoed
  results.sort((a, b) => {
    if (a.isVetoed && !b.isVetoed) return 1;
    if (!a.isVetoed && b.isVetoed) return -1;
    return b.weightedTotal - a.weightedTotal;
  });

  // Assign ranks
  results.forEach((res, index) => {
    res.rank = index + 1;
  });

  return results;
}

/**
 * Generate CSV representation of the decision matrix
 */
export function exportToCSV(project: DecisionProject): string {
  const results = calculateResults(project.criteria, project.options, project.scaleMin, project.scaleMax);
  const resultByOptId = new Map(results.map((r) => [r.option.id, r]));

  const headers = [
    'Option Name',
    'Rank',
    'Weighted Score',
    'Percentage (%)',
    'Status',
    ...project.criteria.map((c) => `${c.name} (W:${c.weight}, ${c.type.toUpperCase()})`),
  ];

  const rows = project.options.map((opt) => {
    const res = resultByOptId.get(opt.id);
    const criterionScores = project.criteria.map((c) => opt.scores[c.id] ?? '');
    return [
      `"${opt.name.replace(/"/g, '""')}"`,
      res?.rank ?? '',
      res?.weightedTotal.toFixed(2) ?? '',
      `${res?.normalizedPercentage.toFixed(1)}%`,
      res?.isVetoed ? 'VETOED' : 'Valid',
      ...criterionScores,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Helper to download a string as a file
 */
export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
