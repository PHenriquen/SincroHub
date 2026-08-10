import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  AssetHealth,
  HealthStatus,
  Incident,
  TelemetryReading
} from "@sincrohub/contracts";
import { randomUUID } from "node:crypto";

const clamp = (value: number) => Math.min(100, Math.max(0, value));

@Injectable()
export class TelemetryService {
  private readonly assets = new Map<string, AssetHealth>();
  private readonly incidents: Incident[] = [];

  ingest(reading: TelemetryReading): AssetHealth {
    const score = this.calculateHealth(reading);
    const status: HealthStatus =
      score < 45 ? "critical" : score < 70 ? "attention" : "healthy";

    const health: AssetHealth = {
      assetId: reading.assetId,
      score,
      status,
      reading,
      evaluatedAt: new Date().toISOString()
    };

    this.assets.set(reading.assetId, health);

    const alreadyOpen = this.incidents.some(
      (incident) => incident.assetId === reading.assetId && incident.status !== "resolved"
    );

    if (status === "critical" && !alreadyOpen) {
      this.incidents.unshift({
        id: randomUUID(),
        assetId: reading.assetId,
        title: `Saúde crítica detectada em ${reading.assetId}`,
        severity: "critical",
        status: "open",
        healthScore: score,
        openedAt: health.evaluatedAt
      });
    }

    return health;
  }

  latest(assetId: string): AssetHealth {
    const health = this.assets.get(assetId);
    if (!health) {
      throw new NotFoundException(`No telemetry found for ${assetId}`);
    }
    return health;
  }

  listIncidents(): Incident[] {
    return this.incidents;
  }

  private calculateHealth(reading: TelemetryReading): number {
    const temperatureHealth = 100 - clamp(((reading.temperatureC - 25) / 55) * 100);
    const vibrationHealth = 100 - clamp((reading.vibrationMmS / 12) * 100);
    const currentHealth = 100 - clamp((reading.currentA / 40) * 100);

    return Math.round(
      temperatureHealth * 0.3 +
      vibrationHealth * 0.4 +
      currentHealth * 0.3
    );
  }
}
