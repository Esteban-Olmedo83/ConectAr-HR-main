import React from 'react';
import type { DevelopmentPlan } from '../types';
import PhaseCard from './PhaseCard';
import ExportControls from './ExportControls';

interface PlanDisplayProps {
  plan: DevelopmentPlan;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan }) => {
  return (
    <div className="mt-10 animate-fade-in">
      <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="text-center">
            <h2 className="text-3xl font-extrabold text-sky-700">{plan.projectName}</h2>
            <p className="mt-2 max-w-2xl mx-auto text-slate-600">{plan.projectDescription}</p>
        </div>
        <ExportControls plan={plan} />
      </div>
      <div className="space-y-8">
        {plan.developmentPhases.map((phase, index) => (
          <PhaseCard key={phase.phaseName} phase={phase} index={index} />
        ))}
      </div>
    </div>
  );
};

export default PlanDisplay;