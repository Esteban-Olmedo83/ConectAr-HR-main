
import React from 'react';
import { BriefcaseIcon } from './icons/BriefcaseIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <BriefcaseIcon className="h-8 w-8 text-sky-600" />
        <h1 className="ml-3 text-2xl font-bold text-slate-800 tracking-tight">
          AI HR System Planner
        </h1>
      </div>
    </header>
  );
};

export default Header;
