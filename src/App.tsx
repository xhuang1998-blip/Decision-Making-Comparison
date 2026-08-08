/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MatrixEditor } from './components/MatrixEditor';
import { VisualAnalysis } from './components/VisualAnalysis';
import { AIExecutiveReport } from './components/AIExecutiveReport';
import { NewProjectModal } from './components/NewProjectModal';
import { DecisionProject } from './types';
import { DECISION_TEMPLATES } from './data/templates';
import { exportToCSV, downloadFile } from './utils/calculator';

const STORAGE_KEY = 'decision_matrix_projects_v1';

export default function App() {
  const [projects, setProjects] = useState<DecisionProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load projects from localStorage:', e);
    }

    // Default initial project from template
    const defaultTmpl = DECISION_TEMPLATES[0];
    const initialProj: DecisionProject = {
      id: 'proj-default-job-offer',
      title: defaultTmpl.title,
      description: defaultTmpl.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scaleMin: 1,
      scaleMax: 10,
      weightMode: 'absolute',
      criteria: defaultTmpl.criteria.map((c, i) => ({
        ...c,
        id: `crit-def-${i}`,
      })),
      options: defaultTmpl.options.map((o, i) => ({
        ...o,
        id: `opt-def-${i}`,
      })),
    };

    return [initialProj];
  });

  const [currentProjectId, setCurrentProjectId] = useState<string>(
    () => projects[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'matrix' | 'analytics' | 'report'>('matrix');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Save to localStorage whenever projects change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects to localStorage:', e);
    }
  }, [projects]);

  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0];

  const handleUpdateProject = (updated: DecisionProject) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleCreateProject = (newProject: DecisionProject) => {
    setProjects((prev) => [newProject, ...prev]);
    setCurrentProjectId(newProject.id);
    setActiveTab('matrix');
  };

  const handleExportJSON = () => {
    if (!currentProject) return;
    const jsonStr = JSON.stringify(currentProject, null, 2);
    downloadFile(
      jsonStr,
      `${currentProject.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_matrix.json`,
      'application/json'
    );
  };

  const handleExportCSV = () => {
    if (!currentProject) return;
    const csvStr = exportToCSV(currentProject);
    downloadFile(
      csvStr,
      `${currentProject.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_matrix.csv`,
      'text/csv'
    );
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const imported = JSON.parse(content);
        if (imported.title && Array.isArray(imported.criteria) && Array.isArray(imported.options)) {
          const newProj: DecisionProject = {
            ...imported,
            id: `proj-${Date.now()}`,
            updatedAt: new Date().toISOString(),
          };
          handleCreateProject(newProj);
        } else {
          alert('Invalid decision project file format.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        projects={projects}
        currentProjectId={currentProject?.id || ''}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSelectProject={(id) => setCurrentProjectId(id)}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onExportCSV={handleExportCSV}
        onGenerateAIReport={() => setActiveTab('report')}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentProject ? (
          <>
            {activeTab === 'matrix' && (
              <MatrixEditor
                project={currentProject}
                onUpdateProject={handleUpdateProject}
                onSwitchToAnalytics={() => setActiveTab('analytics')}
              />
            )}

            {activeTab === 'analytics' && (
              <VisualAnalysis
                project={currentProject}
                onUpdateProject={handleUpdateProject}
              />
            )}

            {activeTab === 'report' && (
              <AIExecutiveReport
                project={currentProject}
                onUpdateProject={handleUpdateProject}
              />
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm">No decision project selected.</p>
          </div>
        )}
      </main>

      {/* New Project / AI Wizard Modal */}
      <NewProjectModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
