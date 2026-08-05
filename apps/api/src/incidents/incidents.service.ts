import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Incident, TransitionIncident } from "@orbital/contracts";
import { randomUUID } from "node:crypto";

@Injectable()
export class IncidentsService {
  private readonly incidents: Incident[] = [];

  openCritical(assetId: string, healthScore: number): Incident {
    const existing = this.incidents.find(
      (incident) => incident.assetId === assetId && incident.status !== "resolved"
    );
    if (existing) return existing;

    const now = new Date().toISOString();
    const incident: Incident = {
      id: randomUUID(),
      assetId,
      title: `Saúde crítica detectada em ${assetId}`,
      severity: "critical",
      status: "open",
      healthScore,
      openedAt: now,
      timeline: [{
        id: randomUUID(),
        type: "opened",
        message: `Incident opened automatically at health ${healthScore}`,
        actor: "rules-engine",
        occurredAt: now
      }]
    };
    this.incidents.unshift(incident);
    return incident;
  }

  list(): Incident[] {
    return structuredClone(this.incidents);
  }

  transition(id: string, command: TransitionIncident): Incident {
    const incident = this.incidents.find((candidate) => candidate.id === id);
    if (!incident) throw new NotFoundException(`Incident ${id} not found`);
    if (incident.status === "resolved") {
      throw new BadRequestException("Resolved incidents cannot change state");
    }
    if (command.status === "resolved" && incident.status === "open") {
      throw new BadRequestException("Acknowledge an incident before resolving it");
    }

    const now = new Date().toISOString();
    incident.status = command.status;
    incident.assignee = command.assignee ?? incident.assignee ?? command.actor;
    if (command.status === "acknowledged") incident.acknowledgedAt = now;
    if (command.status === "resolved") incident.resolvedAt = now;
    incident.timeline.push({
      id: randomUUID(),
      type: command.status,
      message: command.status === "acknowledged" ? "Incident acknowledged" : "Incident resolved",
      actor: command.actor,
      occurredAt: now
    });
    return structuredClone(incident);
  }
}
