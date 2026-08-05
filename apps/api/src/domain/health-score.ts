import type { HealthStatus, TelemetryReading } from "@orbital/contracts";

const clamp = (value: number) => Math.min(100, Math.max(0, value));

export function calculateHealthScore(reading: TelemetryReading): number {
  const temperature = 100 - clamp(((reading.temperatureC - 25) / 55) * 100);
  const vibration = 100 - clamp((reading.vibrationMmS / 12) * 100);
  const current = 100 - clamp((reading.currentA / 40) * 100);

  return Math.round(temperature * 0.3 + vibration * 0.4 + current * 0.3);
}

export function classifyHealth(score: number): HealthStatus {
  if (score < 45) return "critical";
  if (score < 70) return "attention";
  return "healthy";
}
