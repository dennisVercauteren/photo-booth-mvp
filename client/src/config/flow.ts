/**
 * Customer flow.
 * Payment is reserved so it can later sit between style selection and the camera
 * without coupling those screens together. Printing can later be added as a result action.
 */
export const FlowStep = {
  Attract: "attract",
  Style: "style",
  Payment: "payment",
  Camera: "camera",
  Review: "review",
  Generate: "generate",
  Result: "result",
} as const;

export type FlowStep = (typeof FlowStep)[keyof typeof FlowStep];

export const MVP_STEPS: readonly FlowStep[] = [
  FlowStep.Attract,
  FlowStep.Style,
  FlowStep.Camera,
  FlowStep.Review,
  FlowStep.Generate,
  FlowStep.Result,
];

/** Flip this when a payment screen should sit between style selection and the camera. */
export const PAYMENT_STEP_ENABLED = false;

export function stepAfterStyle(): typeof FlowStep.Camera | typeof FlowStep.Payment {
  return PAYMENT_STEP_ENABLED ? FlowStep.Payment : FlowStep.Camera;
}

export const ResultAction = {
  Restyle: "restyle",
  Retake: "retake",
  Download: "download",
  NewSession: "new-session",
} as const;

export type ResultAction = (typeof ResultAction)[keyof typeof ResultAction];

export interface ResultActionDefinition {
  id: ResultAction;
  label: string;
}

export const RESULT_ACTIONS: readonly ResultActionDefinition[] = [
  { id: ResultAction.Restyle, label: "Try Another Style" },
  { id: ResultAction.Retake, label: "Retake Photo" },
  { id: ResultAction.Download, label: "Download" },
  { id: ResultAction.NewSession, label: "New Session" },
];
