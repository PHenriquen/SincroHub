import type { HealthStatus } from "@sincrohub/contracts";

export interface RecoveryDecision {
  streak: number;
  resolved: boolean;
}

export class IncidentRecoveryGate {
  private readonly streaks = new Map<string, number>();

  constructor(private readonly samplesRequired = 3) {
    if (!Number.isInteger(samplesRequired) || samplesRequired < 1) {
      throw new RangeError("samplesRequired must be a positive integer");
    }
  }

  observe(assetId: string, status: HealthStatus): RecoveryDecision {
    if (status !== "healthy") {
      this.streaks.delete(assetId);
      return { streak: 0, resolved: false };
    }

    const streak = (this.streaks.get(assetId) ?? 0) + 1;
    if (streak >= this.samplesRequired) {
      this.streaks.delete(assetId);
      return { streak, resolved: true };
    }

    this.streaks.set(assetId, streak);
    return { streak, resolved: false };
  }

  reset(assetId: string): void {
    this.streaks.delete(assetId);
  }
}
