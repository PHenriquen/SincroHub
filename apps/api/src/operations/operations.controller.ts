import { BadRequestException, Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { transitionIncidentSchema } from "@orbital/contracts";
import { AutomationsService } from "../automations/automations.service";
import { IncidentsService } from "../incidents/incidents.service";

@Controller()
export class OperationsController {
  constructor(
    private readonly incidents: IncidentsService,
    private readonly automations: AutomationsService
  ) {}

  @Get("incidents")
  listIncidents() {
    return this.incidents.list();
  }

  @Get("automations/executions")
  listAutomations() {
    return this.automations.list();
  }

  @Patch("incidents/:id")
  transition(@Param("id") id: string, @Body() body: unknown) {
    const parsed = transitionIncidentSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return this.incidents.transition(id, parsed.data);
  }
}
