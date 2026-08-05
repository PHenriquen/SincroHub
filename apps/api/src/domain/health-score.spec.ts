import { describe, expect, it } from "vitest";
import { calculateHealthScore, classifyHealth } from "./health-score";

describe("health model", () => {
  it("keeps a nominal machine healthy", () => {
    const score = calculateHealthScore({
      assetId: "press-01",
      timestamp: new Date().toISOString(),
      source: "simulator",
      temperatureC: 28,
      vibrationMmS: 1,
      currentA: 8
    });

    expect(score).toBeGreaterThanOrEqual(70);
    expect(classifyHealth(score)).toBe("healthy");
  });

  it("prioritizes critical vibration and heat", () => {
    const score = calculateHealthScore({
      assetId: "press-01",
      timestamp: new Date().toISOString(),
      source: "serial",
      temperatureC: 90,
      vibrationMmS: 14,
      currentA: 45
    });

    expect(score).toBeLessThan(45);
    expect(classifyHealth(score)).toBe("critical");
  });
});
