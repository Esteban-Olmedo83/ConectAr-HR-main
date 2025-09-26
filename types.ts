
export interface Feature {
  feature: string;
  description: string;
}

export interface Module {
  moduleName: string;
  features: Feature[];
  ui_ux_notes: string;
}

export interface Phase {
  phaseName: string;
  description: string;
  modules: Module[];
}

export interface DevelopmentPlan {
  projectName: string;
  projectDescription: string;
  developmentPhases: Phase[];
}
