import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  AssetHealth,
  HealthStatus,
  Incident,
  TelemetryReading
} from "@sincrohub/contracts";
import { randomUUID } from "node:crypto";
import { AnomalyDetector, type AnomalyResult } from "../analytics/anomaly-detector";
import {
  WindowAggregator,
  type TelemetrySample
} from "../data/window-aggregator";

const clamp = (value: number) => Math.min(100, Math.max(0, value));
const MAX_ANALYTICS_SAMPLES = 1_000;
const BASELINE_SAMPLES = 10;

@Injectable()
export class TelemetryService {
  private readonly assets = new Map<string, AssetHealth>();
  private readonly incidents: Incident[] = [];
  private readonly analyticsSamples = new Map<string, TelemetrySample[]>();
  private readonly anomalyDetectors = new Map<string, AnomalyDetector>();
  private readonly latestAnomalies = new Map<string, AnomalyResult>();
  private readonly aggregator = new WindowAggregator(60_000);

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
    this.recordAnalytics(reading);

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

  analytics(assetId: string) {
    const samples = this.analyticsSamples.get(assetId);
    if (!samples?.length) {
      throw new NotFoundException(`No analytics data found for ${assetId}`);
    }

    return {
      assetId,
      sampleCount: samples.length,
      modelReady: this.anomalyDetectors.has(assetId),
      latestAnomaly: this.latestAnomalies.get(assetId) ?? null,
      windows: this.aggregator.aggregate(samples)
    };
  }

  listIncidents(): Incident[] {
    return this.incidents;
  }

  private recordAnalytics(reading: TelemetryReading): void {
    const sample: TelemetrySample = {
      assetId: reading.assetId,
      timestamp: Date.parse(reading.timestamp),
      temperature: reading.temperatureC,
      vibration: reading.vibrationMmS,
      current: reading.currentA
    };

    const samples = this.analyticsSamples.get(reading.assetId) ?? [];
    samples.push(sample);
    if (samples.length > MAX_ANALYTICS_SAMPLES) {
      samples.splice(0, samples.length - MAX_ANALYTICS_SAMPLES);
    }
    this.analyticsSamples.set(reading.assetId, samples);

    let detector = this.anomalyDetectors.get(reading.assetId);
    if (!detector && samples.length >= BASELINE_SAMPLES) {
      detector = new AnomalyDetector();
      detector.fit(
        samples.slice(0, BASELINE_SAMPLES).map((item) => ({
          temperature: item.temperature,
          vibration: item.vibration,
          current: item.current
        }))
      );
      this.anomalyDetectors.set(reading.assetId, detector);
    }

    if (detector) {
      this.latestAnomalies.set(
        reading.assetId,
        detector.predict({
          temperature: sample.temperature,
          vibration: sample.vibration,
          current: sample.current
        })
      );
    }
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
