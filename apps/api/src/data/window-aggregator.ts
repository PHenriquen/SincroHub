export type TelemetrySample = {
  assetId: string;
  timestamp: number;
  temperature: number;
  vibration: number;
  current: number;
};

export type WindowAggregate = {
  assetId: string;
  windowStart: number;
  windowEnd: number;
  samples: number;
  temperatureAvg: number;
  vibrationAvg: number;
  currentAvg: number;
  temperatureMax: number;
  vibrationMax: number;
  currentMax: number;
};

/**
 * Small in-memory streaming aggregator used by the vertical slice.
 *
 * In production this abstraction can be backed by Redis Streams, Kafka or a
 * cloud queue without changing the aggregate contract consumed by analytics.
 */
export class WindowAggregator {
  constructor(private readonly windowMs = 60_000) {}

  aggregate(samples: TelemetrySample[]): WindowAggregate[] {
    const buckets = new Map<string, TelemetrySample[]>();

    for (const sample of samples) {
      const windowStart = Math.floor(sample.timestamp / this.windowMs) * this.windowMs;
      const key = `${sample.assetId}:${windowStart}`;
      const bucket = buckets.get(key) ?? [];
      bucket.push(sample);
      buckets.set(key, bucket);
    }

    return [...buckets.entries()]
      .map(([key, bucket]) => this.toAggregate(key, bucket))
      .sort((a, b) => a.windowStart - b.windowStart);
  }

  private toAggregate(key: string, samples: TelemetrySample[]): WindowAggregate {
    const separator = key.lastIndexOf(':');
    const assetId = key.slice(0, separator);
    const windowStart = Number(key.slice(separator + 1));
    const count = Math.max(samples.length, 1);

    return {
      assetId,
      windowStart,
      windowEnd: windowStart + this.windowMs,
      samples: samples.length,
      temperatureAvg: samples.reduce((sum, item) => sum + item.temperature, 0) / count,
      vibrationAvg: samples.reduce((sum, item) => sum + item.vibration, 0) / count,
      currentAvg: samples.reduce((sum, item) => sum + item.current, 0) / count,
      temperatureMax: Math.max(...samples.map((item) => item.temperature)),
      vibrationMax: Math.max(...samples.map((item) => item.vibration)),
      currentMax: Math.max(...samples.map((item) => item.current)),
    };
  }
}
