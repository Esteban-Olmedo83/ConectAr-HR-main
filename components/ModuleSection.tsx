
import React from 'react';
import type { Module, Feature } from '../types';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { RocketLaunchIcon } from './icons/RocketLaunchIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ClockIcon } from './icons/ClockIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';

const getModuleIcon = (moduleName: string): React.ReactNode => {
    const lowerCaseName = moduleName.toLowerCase();
    if (lowerCaseName.includes('empleado') || lowerCaseName.includes('core')) return <UserGroupIcon className="w-6 h-6 text-sky-600" />;
    if (lowerCaseName.includes('reclutamiento') || lowerCaseName.includes('talento')) return <RocketLaunchIcon className="w-6 h-6 text-sky-600" />;
    if (lowerCaseName.includes('desempeño') || lowerCaseName.includes('performance')) return <ChartBarIcon className="w-6 h-6 text-sky-600" />;
    if (lowerCaseName.includes('tiempo') || lowerCaseName.includes('asistencia')) return <ClockIcon className="w-6 h-6 text-sky-600" />;
    if (lowerCaseName.includes('aprendizaje') || lowerCaseName.includes('desarrollo') || lowerCaseName.includes('capacitación')) return <AcademicCapIcon className="w-6 h-6 text-sky-600" />;
    if (lowerCaseName.includes('onboarding') || lowerCaseName.includes('incorporación')) return <ClipboardDocumentListIcon className="w-6 h-6 text-sky-600" />;
    return <BriefcaseIcon className="w-6 h-6 text-sky-600" />;
};


const FeatureItem: React.FC<{ feature: Feature }> = ({ feature }) => (
    <li className="flex items-start">
        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <div>
            <h5 className="font-semibold text-slate-700">{feature.feature}</h5>
            <p className="text-sm text-slate-600">{feature.description}</p>
        </div>
    </li>
);

const ModuleSection: React.FC<{ module: Module }> = ({ module }) => {
  return (
    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
        <div className="flex items-center mb-4">
            {getModuleIcon(module.moduleName)}
            <h4 className="text-lg font-semibold text-slate-800 ml-3">{module.moduleName}</h4>
        </div>

        <div className="pl-2">
            <h5 className="font-semibold text-slate-600 mb-2">Características Clave:</h5>
            <ul className="space-y-3 mb-4">
                {module.features.map((feature) => (
                    <FeatureItem key={feature.feature} feature={feature} />
                ))}
            </ul>

            <div className="p-3 bg-sky-50 border-l-4 border-sky-400 rounded-r-md">
                <div className="flex items-start">
                    <LightBulbIcon className="w-5 h-5 text-sky-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                        <h6 className="font-semibold text-sky-800">Notas de UI/UX</h6>
                        <p className="text-sm text-sky-700">{module.ui_ux_notes}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ModuleSection;
