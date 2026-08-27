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

export const healthStatusSchema = z.enum(["healthy", "attention", "critical"]);
export type HealthStatus = z.infer<typeof healthStatusSchema>;

export interface AssetHealth {
  assetId: string;
  score: number;
  status: HealthStatus;
  reading: TelemetryReading;
  evaluatedAt: string;
}

export interface Incident {
  id: string;
  assetId: string;
  title: string;
  severity: "warning" | "critical";
  status: "open" | "acknowledged" | "resolved";
  healthScore: number;
  openedAt: string;
  lastObservedAt: string;
  occurrenceCount: number;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  recoveringSince?: string;
  resolvedAt?: string;
}

export const acknowledgeIncidentSchema = z.object({
  actor: z.string().trim().min(2).max(80)
});

export type AcknowledgeIncident = z.infer<typeof acknowledgeIncidentSchema>;
