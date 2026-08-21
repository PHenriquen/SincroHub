import assert from "node:assert/strict";
import test from "node:test";
import { IncidentRecoveryGate } from "./incident-recovery-gate";

test("resolves only after the configured healthy streak", () => {
  const gate = new IncidentRecoveryGate(3);

  assert.deepEqual(gate.observe("motor-01", "healthy"), { streak: 1, resolved: false });
  assert.deepEqual(gate.observe("motor-01", "healthy"), { streak: 2, resolved: false });
  assert.deepEqual(gate.observe("motor-01", "healthy"), { streak: 3, resolved: true });
});

test("attention breaks a recovery streak", () => {
  const gate = new IncidentRecoveryGate(3);

  gate.observe("motor-01", "healthy");
  gate.observe("motor-01", "healthy");
  assert.deepEqual(gate.observe("motor-01", "attention"), { streak: 0, resolved: false });
  assert.deepEqual(gate.observe("motor-01", "healthy"), { streak: 1, resolved: false });
});

test("tracks assets independently", () => {
  const gate = new IncidentRecoveryGate(2);

  assert.equal(gate.observe("motor-a", "healthy").resolved, false);
  assert.equal(gate.observe("motor-b", "healthy").resolved, false);
  assert.equal(gate.observe("motor-a", "healthy").resolved, true);
  assert.equal(gate.observe("motor-b", "healthy").resolved, true);
});

test("reset cancels recovery progress", () => {
  const gate = new IncidentRecoveryGate(2);

  gate.observe("motor-01", "healthy");
  gate.reset("motor-01");
  assert.deepEqual(gate.observe("motor-01", "healthy"), { streak: 1, resolved: false });
});
