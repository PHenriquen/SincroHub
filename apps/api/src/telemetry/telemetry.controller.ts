import { BadRequestException, Body, Controller, Get, Param, Post } from "@nestjs/common";
import { telemetryReadingSchema } from "@orbital/contracts";
import { TelemetryService } from "./telemetry.service";
import { AutomationsService } from "../automations/automations.service";
import { IncidentsService } from "../incidents/incidents.service";

@Controller()
export class TelemetryController {
  constructor(
    private readonly telemetry: TelemetryService,
    private readonly incidents: IncidentsService,
    private readonly automations: AutomationsService
  ) {}

  @Post("telemetry")
  ingest(@Body() body: unknown) {
    const parsed = telemetryReadingSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return this.telemetry.ingest(parsed.data);
  }

  @Get("assets/:assetId/latest")
  latest(@Param("assetId") assetId: string) {
    return this.telemetry.latest(assetId);
  }

  @Get("command-center")
  snapshot() {
    return {
      assets: this.telemetry.listAssets(),
      incidents: this.incidents.list(),
      automations: this.automations.list(),
      generatedAt: new Date().toISOString()
    };
  }

}
