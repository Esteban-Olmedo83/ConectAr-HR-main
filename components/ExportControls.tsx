import React, { useState } from 'react';
import type { DevelopmentPlan } from '../types';
import JSZip from 'jszip';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';

interface ExportControlsProps {
    plan: DevelopmentPlan;
}

const ExportControls: React.FC<ExportControlsProps> = ({ plan }) => {
    const [isZipping, setIsZipping] = useState(false);

    const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    const handleDownloadJson = () => {
        const jsonString = JSON.stringify(plan, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${slugify(plan.projectName)}-plan.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadCodeStubs = async () => {
        setIsZipping(true);
        try {
            const zip = new JSZip();
            const rootFolder = zip.folder(slugify(plan.projectName));

            if (rootFolder) {
                const readmeContent = `# ${plan.projectName}

${plan.projectDescription}

Este proyecto fue iniciado con AI HR System Planner.

## Primeros Pasos

Una vez que hayas descomprimido este archivo, sigue estos pasos para comenzar:

1.  **Navega al directorio del proyecto:**
    \`\`\`bash
    cd ${slugify(plan.projectName)}
    \`\`\`

2.  **Inicializa el repositorio de Git:**
    Este proyecto incluye un archivo \`.gitignore\` para asegurar que solo se versionen los archivos correctos.
    \`\`\`bash
    git init
    git add .
    git commit -m "Commit inicial del AI HR System Planner"
    \`\`\`

3.  **Instala las dependencias y comienza a desarrollar:**
    (Asumiendo un entorno Node.js con npm o yarn)
    \`\`\`bash
    npm install
    npm run dev # o el comando start que configures
    \`\`\`
`;
                rootFolder.file('README.md', readmeContent);

                const gitignoreContent = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnpm
/pnpm-lock.yaml
/yarn.lock
/package-lock.json

# testing
/coverage

# production
/build
/dist

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
`;
                rootFolder.file('.gitignore', gitignoreContent);


                plan.developmentPhases.forEach(phase => {
                    const phaseFolder = rootFolder.folder(`src/phases/${slugify(phase.phaseName)}`);
                    phase.modules.forEach(module => {
                        const moduleFolder = phaseFolder?.folder(slugify(module.moduleName));
                        const componentName = module.moduleName.replace(/\s+/g, '').replace(/[^\w]/g, '');

                        const componentContent = `import React from 'react';

interface ${componentName}Props {
  // TODO: Define component props based on features
}

/**
 * ${module.ui_ux_notes}
 */
const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">${module.moduleName}</h2>
      <p className="mt-2">This component will contain the features for the ${module.moduleName} module.</p>
      {/* TODO: Implement UI based on features listed in features.md */}
    </div>
  );
};

export default ${componentName};
`;
                        moduleFolder?.file(`${componentName}.tsx`, componentContent);

                        const featuresContent = `# Features for ${module.moduleName}

${module.features.map(f => `- **${f.feature}:** ${f.description}`).join('\n')}

## UI/UX Notes
${module.ui_ux_notes}
`;
                        moduleFolder?.file('features.md', featuresContent);
                    });
                });
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${slugify(plan.projectName)}-starter-code.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Failed to create zip file:", error);
            alert("Hubo un error al generar el archivo zip.");
        } finally {
            setIsZipping(false);
        }
    };

    return (
        <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-center text-slate-700">Próximos Pasos</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={handleDownloadJson}
                    className="w-full flex justify-center items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                >
                    <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                    Descargar Plan (JSON)
                </button>
                <button
                    onClick={handleDownloadCodeStubs}
                    disabled={isZipping}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isZipping ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generando...
                        </>
                    ) : (
                         <>
                            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                            Descargar Código Inicial (.zip)
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ExportControls;