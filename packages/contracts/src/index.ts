import { z } from "zod";

export const telemetryReadingSchema = z.object({
  assetId: z.string().min(1),
  timestamp: z.string().datetime(),
  source: z.enum(["serial", "simulator", "api"]),
  temperatureC: z.number().min(-50).max(250),
  vibrationMmS: z.number().min(0).max(100),
  currentA: z.number().min(0).max(500),
  productionCount: z.number().int().nonnegative().optional()
});

export type TelemetryReading = z.infer<typeof telemetryReadingSchema>;

export const assetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: z.enum(["machine", "service", "integration"]),
  location: z.string().min(1),
  status: z.enum(["online", "degraded", "offline"])
});
export type Asset = z.infer<typeof assetSchema>;

export const healthStatusSchema = z.enum(["healthy", "attention", "critical"]);
export type HealthStatus = z.infer<typeof healthStatusSchema>;

export interface AssetHealth {
  assetId: string;
  score: number;
  status: HealthStatus;
  reading: TelemetryReading;
  evaluatedAt: string;
}

export const incidentStatusSchema = z.enum(["open", "acknowledged", "resolved"]);
export type IncidentStatus = z.infer<typeof incidentStatusSchema>;

export const incidentEventSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["opened", "acknowledged", "resolved", "automation.executed"]),
  message: z.string().min(1),
  actor: z.string().min(1),
  occurredAt: z.string().datetime()
});
export type IncidentEvent = z.infer<typeof incidentEventSchema>;

export const incidentSchema = z.object({
  id: z.string().uuid(),
  assetId: z.string().min(1),
  title: z.string().min(1),
  severity: z.enum(["warning", "critical"]),
  status: incidentStatusSchema,
  healthScore: z.number().min(0).max(100),
  openedAt: z.string().datetime(),
  acknowledgedAt: z.string().datetime().optional(),
  resolvedAt: z.string().datetime().optional(),
  assignee: z.string().optional(),
  timeline: z.array(incidentEventSchema)
});
export type Incident = z.infer<typeof incidentSchema>;

export const transitionIncidentSchema = z.object({
  status: z.enum(["acknowledged", "resolved"]),
  actor: z.string().trim().min(2).max(80),
  assignee: z.string().trim().min(2).max(80).optional()
});
export type TransitionIncident = z.infer<typeof transitionIncidentSchema>;

export const automationExecutionSchema = z.object({
  id: z.string().uuid(),
  incidentId: z.string().uuid(),
  rule: z.string().min(1),
  action: z.enum(["notify-operations", "create-task"]),
  status: z.literal("completed"),
  executedAt: z.string().datetime()
});
export type AutomationExecution = z.infer<typeof automationExecutionSchema>;

export interface CommandCenterSnapshot {
  assets: Array<Asset & { health?: AssetHealth }>;
  incidents: Incident[];
  automations: AutomationExecution[];
  generatedAt: string;
}
