# Incident lifecycle

SincroHub treats an incident as an episode, not as one telemetry sample.

## Why

The first implementation opened one incident per asset when health became critical, but never closed it automatically. That meant a recovered asset could remain permanently attached to an old open incident and a later failure could not become a new episode.

The recovery path now uses a small amount of hysteresis:

1. a critical reading opens an incident immediately;
2. repeated critical readings are folded into the same active incident and increase `occurrenceCount`;
3. an attention reading keeps the incident active and cancels recovery progress;
4. a healthy reading starts or continues recovery;
5. three consecutive healthy readings resolve the incident;
6. a later critical reading creates a new incident with a new id.

While recovering, the public status stays `open`/`acknowledged` for compatibility. `recoveringSince` exposes that the signal is improving without inventing a new API status before the UI is ready to represent it.

## Design references

The design borrows principles, not implementation details, from mature alerting systems:

- Prometheus Alertmanager groups and deduplicates related alerts so one underlying problem does not produce a notification storm: https://prometheus.io/docs/alerting/latest/alertmanager/
- Prometheus alert rules support `keep_firing_for`, keeping an alert active briefly after the condition clears to reduce flapping and false resolutions: https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/
- Grafana models an explicit `Recovering` phase and recommends recovery thresholds / keep-firing periods to avoid rapid firing-resolved-firing transitions: https://grafana.com/docs/grafana/latest/alerting/alerting-rules/create-grafana-managed-rule/
- Google SRE guidance notes that alert rules can flap and recommends requiring persistence across evaluations before changing alert state: https://sre.google/sre-book/practical-alerting/

## Current gate

Three healthy samples is intentionally sample-based rather than time-based because the prototype accepts telemetry from serial, simulator and API sources with different rates. It is deterministic and easy to test, but it is not the final industrial rule.

Before production use, move recovery policy into per-asset configuration and prefer time windows or domain-specific recovery thresholds when sample cadence is known.

## Metadata

Each incident now records:

- `occurrenceCount`: number of critical observations folded into this episode;
- `lastObservedAt`: last telemetry evaluation while the incident was active;
- `recoveringSince`: first healthy evaluation in the current uninterrupted recovery streak;
- `resolvedAt`: time the recovery gate resolved the episode.

This metadata is deliberately operational. It avoids storing a second copy of all telemetry inside the incident; the analytics stream remains the source for detailed sensor history.
