import React from 'react';
import {
  BrainCircuit,
  Plus,
  Download,
  Upload,
  FolderOpen,
  Sparkles,
  FileSpreadsheet,
  CheckSquare,
  BarChart3,
  SlidersHorizontal,
  FileText,
} from 'lucide-react';
import { DecisionProject } from '../types';

interface NavbarProps {
  projects: DecisionProject[];
  currentProjectId: string;
  activeTab: 'matrix' | 'analytics' | 'report';
  onTabChange: (tab: 'matrix' | 'analytics' | 'report') => void;
  onSelectProject: (id: string) => void;
  onOpenNewModal: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportCSV: () => void;
  onGenerateAIReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  projects,
  currentProjectId,
  activeTab,
  onTabChange,
  onSelectProject,
  onOpenNewModal,
  onExportJSON,
  onImportJSON,
  onExportCSV,
  onGenerateAIReport,
}) => {
  const currentProject = projects.find((p) => p.id === currentProjectId);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                Decision Matrix & Data Analyzer
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Weighted scoring & interactive visual analytics
              </p>
            </div>
          </div>

          {/* Project Selector & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Project Switcher */}
            <div className="relative">
              <select
                id="project-selector"
                value={currentProjectId}
                onChange={(e) => onSelectProject(e.target.value)}
                className="pl-3 pr-8 py-1.5 text-xs sm:text-sm font-medium bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white max-w-[150px] sm:max-w-[220px] truncate cursor-pointer transition-colors"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* New Decision Button */}
            <button
              id="new-decision-btn"
              onClick={onOpenNewModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Decision</span>
            </button>

            {/* Data Tools Menu */}
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2 sm:pl-3">
              <button
                id="export-csv-btn"
                onClick={onExportCSV}
                title="Export Matrix as CSV"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button
                id="export-json-btn"
                onClick={onExportJSON}
                title="Export Project JSON"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>

              <label
                id="import-json-btn"
                title="Import Project JSON"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportJSON}
                  className="hidden"
                />
              </label>

              {/* AI Report Trigger Button */}
              <button
                id="generate-ai-report-btn"
                onClick={onGenerateAIReport}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-600 fill-amber-200" />
                <span className="hidden md:inline">AI Executive Summary</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-t border-slate-100 -mb-px space-x-6 overflow-x-auto scrollbar-none">
          <button
            id="tab-matrix"
            onClick={() => onTabChange('matrix')}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Decision Matrix & Scores
          </button>

          <button
            id="tab-analytics"
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Visual Analytics & Radar
          </button>

          <button
            id="tab-report"
            onClick={() => onTabChange('report')}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'report'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            AI Executive Report
            {currentProject?.aiAnalysis && (
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
