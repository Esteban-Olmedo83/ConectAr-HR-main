
import React from 'react';

interface PlannerFormProps {
  userInput: string;
  setUserInput: (input: string) => void;
  onGeneratePlan: () => void;
  isLoading: boolean;
}

const PlannerForm: React.FC<PlannerFormProps> = ({ userInput, setUserInput, onGeneratePlan, isLoading }) => {
  return (
    <div className="bg-white p-6 shadow-md rounded-lg border border-slate-200">
      <label htmlFor="hr-vision" className="block text-lg font-semibold text-slate-700">
        Describe tu visión del Sistema de RRHH
      </label>
      <p className="mt-1 text-sm text-slate-500 mb-4">
        Describe los objetivos, módulos clave o cualquier característica específica que tengas en mente.
      </p>
      <textarea
        id="hr-vision"
        rows={5}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out"
        placeholder="Ej: 'Necesito un sistema para gestionar empleados, seguimiento de candidatos y evaluaciones de desempeño...'"
        disabled={isLoading}
      />
      <button
        onClick={onGeneratePlan}
        disabled={isLoading}
        className="mt-4 w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generando Plan...
          </>
        ) : (
          'Generar Plan de Desarrollo'
        )}
      </button>
    </div>
  );
};

export default PlannerForm;
