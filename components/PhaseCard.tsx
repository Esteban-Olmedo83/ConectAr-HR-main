
import React, { useState } from 'react';
import type { Phase } from '../types';
import ModuleSection from './ModuleSection';

interface PhaseCardProps {
  phase: Phase;
  index: number;
}

const PhaseCard: React.FC<PhaseCardProps> = ({ phase, index }) => {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-5 text-left bg-slate-50 hover:bg-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-sky-500 focus-visible:ring-opacity-75"
      >
        <div>
          <span className="text-sm font-semibold text-sky-600 uppercase tracking-wider">Fase {index + 1}</span>
          <h3 className="text-xl font-bold text-slate-800 mt-1">{phase.phaseName}</h3>
        </div>
        <svg
          className={`w-6 h-6 text-slate-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      {isOpen && (
        <div className="p-5 border-t border-slate-200 animate-slide-down">
          <p className="text-slate-600 mb-6">{phase.description}</p>
          <div className="space-y-6">
            {phase.modules.map((module) => (
              <ModuleSection key={module.moduleName} module={module} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaseCard;
