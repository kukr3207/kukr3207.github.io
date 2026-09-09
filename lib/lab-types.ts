export type Usage = {
  input: number | null;
  output: number | null;
  total: number | null;
  cached: number | null;
};
export type Completion = {
  text: string;
  requestedModel: string;
  model: string;
  usage: Usage;
  durationMs: number;
  timestamp: string;
  finishReason?: string | null;
  settings?: {
    temperature: number;
    maxOutputTokens: number;
    reasoningEffort: string | null;
  };
};
export type CheckReport = {
  status: 'passed' | 'failed' | 'infrastructure_error' | 'invalid_reporting';
  command: string;
  exitCode: number | null;
  imageId?: string;
  checks: { id: string; passed: boolean; observed: string; expected: string }[];
  summary: string;
  timestamp: string;
  codeHash: string;
  checksHash: string;
};
export type TrajectoryTurn = {
  id: string;
  prompt: string;
  response?: Completion;
  code?: string;
  error?: string;
  failureUsage?: Usage;
  checks?: CheckReport;
};
export type ModelTrajectory = {
  id: 'A' | 'B';
  requestedModel: string;
  turns: TrajectoryTurn[];
};
export type LabSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  task: string;
  reference: string;
  baselineCheck?: CheckReport;
  referenceCheck?: CheckReport;
  lock?: {
    digest: string;
    timestamp: string;
    imageId: string;
    checksHash: string;
    coverageConfirmed: boolean;
  };
  taskAudit?: Completion;
  qualityReviews: {
    candidate: string;
    turnId: string;
    analysis: Completion;
    input: {
      task: string;
      starter: string;
      candidate: string;
      actualChecks: CheckReport | 'not_run';
      proposedFindings: string;
    };
  }[];
  trajectories: ModelTrajectory[];
  tokenTarget: number;
  human: {
    rubric: string;
    rationale: string;
    evidenceNotes: string;
    qualityDecisions: string;
  };
  events: { timestamp: string; message: string }[];
};
export type LabStatus = {
  configured: boolean;
  gatewayReachable: boolean;
  models: { id: string; label: string }[];
  localOnly: boolean;
  verification: boolean;
  dailyRequests: number;
  dailyLimit: number;
  message: string;
};
