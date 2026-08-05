import { Injectable } from "@nestjs/common";
import type { AutomationExecution, Incident } from "@orbital/contracts";
import { randomUUID } from "node:crypto";

@Injectable()
export class AutomationsService {
  private readonly executions: AutomationExecution[] = [];

  onIncidentOpened(incident: Incident): AutomationExecution | undefined {
    if (this.executions.some((item) => item.incidentId === incident.id)) return undefined;

    const execution: AutomationExecution = {
      id: randomUUID(),
      incidentId: incident.id,
      rule: "critical-asset-response",
      action: "create-task",
      status: "completed",
      executedAt: new Date().toISOString()
    };
    this.executions.unshift(execution);
    incident.timeline.push({
      id: randomUUID(),
      type: "automation.executed",
      message: "Operational response task created",
      actor: "automation-core",
      occurredAt: execution.executedAt
    });
    return execution;
  }

  list(): AutomationExecution[] {
    return structuredClone(this.executions);
  }
}
