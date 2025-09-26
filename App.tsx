
import React, { useState, useCallback } from 'react';
import type { DevelopmentPlan } from './types';
import { generateHrPlan } from './services/geminiService';
import Header from './components/Header';
import PlannerForm from './components/PlannerForm';
import PlanDisplay from './components/PlanDisplay';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import { SparklesIcon } from './components/icons/SparklesIcon';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('Quiero desarrollar un sistema de recursos humanos, acorde a lo mejor disponible en la actualidad. Para ello debemos preparar un plan para desarrollar la estructura desde 0.');
  const [plan, setPlan] = useState<DevelopmentPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = useCallback(async () => {
    if (!userInput.trim()) {
      setError('Por favor, describe tu visión para el sistema de RRHH.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPlan(null);

    try {
      const generatedPlan = await generateHrPlan(userInput);
      setPlan(generatedPlan);
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al generar el plan. Por favor, revisa la consola para más detalles o intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [userInput]);

  return (
    <div className="min-h-screen bg-slate-100/50 text-slate-800 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <PlannerForm
            userInput={userInput}
            setUserInput={setUserInput}
            onGeneratePlan={handleGeneratePlan}
            isLoading={isLoading}
          />
          
          {isLoading && <Loader />}
          {error && <ErrorMessage message={error} />}
          
          {plan ? (
            <PlanDisplay plan={plan} />
          ) : (
            !isLoading && !error && (
              <div className="mt-12 text-center p-8 border-2 border-dashed border-slate-300 rounded-xl bg-white">
                <SparklesIcon className="mx-auto h-12 w-12 text-sky-500" />
                <h2 className="mt-4 text-xl font-semibold text-slate-700">Listo para planificar</h2>
                <p className="mt-2 text-slate-500">
                  Describe tu proyecto de RRHH en el campo de arriba y haz clic en "Generar Plan" para ver la magia de la IA.
                </p>
              </div>
            )
          )}
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-slate-500">
        <p>Powered by Google Gemini API</p>
      </footer>
    </div>
  );
};

export default App;
