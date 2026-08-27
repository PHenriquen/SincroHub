import assert from "node:assert/strict";
import test from "node:test";
import { ConflictException } from "@nestjs/common";
import type { TelemetryReading } from "@sincrohub/contracts";
import { TelemetryService } from "./telemetry.service";

const reading = (overrides: Partial<TelemetryReading> = {}): TelemetryReading => ({
  assetId: "press-01",
  timestamp: new Date().toISOString(),
  source: "simulator",
  temperatureC: 34,
  vibrationMmS: 2,
  currentA: 10,
  ...overrides
});

test("acknowledges an active incident and preserves ownership through recovery", () => {
  const telemetry = new TelemetryService();
  telemetry.ingest(reading({ temperatureC: 120, vibrationMmS: 40, currentA: 100 }));
  const incident = telemetry.listIncidents()[0];
  const acknowledged = telemetry.acknowledgeIncident(incident.id, "Operação local");

  assert.equal(acknowledged.status, "acknowledged");
  assert.equal(acknowledged.acknowledgedBy, "Operação local");
  assert.ok(acknowledged.acknowledgedAt);

  telemetry.ingest(reading());
  telemetry.ingest(reading());
  telemetry.ingest(reading());

  assert.equal(incident.status, "resolved");
  assert.ok(incident.resolvedAt);
  assert.equal(incident.acknowledgedBy, "Operação local");
});

test("repeated acknowledgement is idempotent", () => {
  const telemetry = new TelemetryService();
  telemetry.ingest(reading({ temperatureC: 120, vibrationMmS: 40, currentA: 100 }));
  const incident = telemetry.listIncidents()[0];
  const first = telemetry.acknowledgeIncident(incident.id, "Operação local");
  const second = telemetry.acknowledgeIncident(incident.id, "Outro operador");

  assert.equal(second, first);
  assert.equal(second.acknowledgedBy, "Operação local");
});

test("does not acknowledge an incident after recovery", () => {
  const telemetry = new TelemetryService();
  telemetry.ingest(reading({ temperatureC: 120, vibrationMmS: 40, currentA: 100 }));
  const incident = telemetry.listIncidents()[0];
  telemetry.ingest(reading());
  telemetry.ingest(reading());
  telemetry.ingest(reading());

  assert.throws(
    () => telemetry.acknowledgeIncident(incident.id, "Operação local"),
    ConflictException
  );
});
