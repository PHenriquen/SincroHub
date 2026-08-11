export type NumericVector = {
  temperature: number;
  vibration: number;
  current: number;
};

export type AnomalyResult = {
  score: number;
  anomalous: boolean;
  contributions: NumericVector;
};

/**
 * Lightweight statistical anomaly detector.
 *
 * It is intentionally dependency-free and trainable from healthy baseline
 * telemetry. The model stores mean/stddev for each signal and computes a
 * weighted z-score. It gives SincroHub an auditable ML/statistics layer before
 * introducing heavier model-serving infrastructure.
 */
export class AnomalyDetector {
  private mean: NumericVector = { temperature: 0, vibration: 0, current: 0 };
  private stddev: NumericVector = { temperature: 1, vibration: 1, current: 1 };
  private trained = false;

  constructor(
    private readonly threshold = 2.5,
    private readonly weights: NumericVector = {
      temperature: 0.3,
      vibration: 0.4,
      current: 0.3,
    },
  ) {}

  fit(samples: NumericVector[]): void {
    if (samples.length < 2) {
      throw new Error('at least two baseline samples are required');
    }

    this.mean = this.average(samples);
    this.stddev = {
      temperature: this.standardDeviation(samples.map((sample) => sample.temperature), this.mean.temperature),
      vibration: this.standardDeviation(samples.map((sample) => sample.vibration), this.mean.vibration),
      current: this.standardDeviation(samples.map((sample) => sample.current), this.mean.current),
    };
    this.trained = true;
  }

  predict(sample: NumericVector): AnomalyResult {
    if (!this.trained) {
      throw new Error('detector must be trained before prediction');
    }

    const contributions = {
      temperature: Math.abs((sample.temperature - this.mean.temperature) / this.stddev.temperature),
      vibration: Math.abs((sample.vibration - this.mean.vibration) / this.stddev.vibration),
      current: Math.abs((sample.current - this.mean.current) / this.stddev.current),
    };

    const score =
      contributions.temperature * this.weights.temperature +
      contributions.vibration * this.weights.vibration +
      contributions.current * this.weights.current;

    return {
      score,
      anomalous: score >= this.threshold,
      contributions,
    };
  }

  snapshot(): { mean: NumericVector; stddev: NumericVector; threshold: number } {
    if (!this.trained) {
      throw new Error('detector must be trained before snapshot');
    }
    return { mean: this.mean, stddev: this.stddev, threshold: this.threshold };
  }

  private average(samples: NumericVector[]): NumericVector {
    const count = samples.length;
    return {
      temperature: samples.reduce((sum, item) => sum + item.temperature, 0) / count,
      vibration: samples.reduce((sum, item) => sum + item.vibration, 0) / count,
      current: samples.reduce((sum, item) => sum + item.current, 0) / count,
    };
  }

  private standardDeviation(values: number[], mean: number): number {
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
    return Math.max(Math.sqrt(variance), Number.EPSILON);
  }
}
