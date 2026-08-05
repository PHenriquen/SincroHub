import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  Asset,
  AssetHealth,
  TelemetryReading
} from "@orbital/contracts";
import { AutomationsService } from "../automations/automations.service";
import { calculateHealthScore, classifyHealth } from "../domain/health-score";
import { IncidentsService } from "../incidents/incidents.service";

@Injectable()
export class TelemetryService {
  private readonly assets = new Map<string, AssetHealth>();
  private readonly registry = new Map<string, Asset>([["press-01", {
    id: "press-01",
    name: "Hydraulic Press 01",
    kind: "machine",
    location: "Assembly / Line A",
    status: "online"
  }]]);

  constructor(
    private readonly incidents: IncidentsService,
    private readonly automations: AutomationsService
  ) {}

  ingest(reading: TelemetryReading): AssetHealth {
    const score = calculateHealthScore(reading);
    const status = classifyHealth(score);

    const health: AssetHealth = {
      assetId: reading.assetId,
      score,
      status,
      reading,
      evaluatedAt: new Date().toISOString()
    };

    this.assets.set(reading.assetId, health);

    if (!this.registry.has(reading.assetId)) {
      this.registry.set(reading.assetId, {
        id: reading.assetId,
        name: reading.assetId,
        kind: "machine",
        location: "Unassigned",
        status: "online"
      });
    }

    if (status === "critical") {
      const incident = this.incidents.openCritical(reading.assetId, score);
      this.automations.onIncidentOpened(incident);
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

  listAssets() {
    return Array.from(this.registry.values()).map((asset) => ({
      ...asset,
      health: this.assets.get(asset.id)
    }));
  }
}
