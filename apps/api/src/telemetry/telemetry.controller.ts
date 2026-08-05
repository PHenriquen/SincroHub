import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { telemetryReadingSchema } from "@orbital/contracts";
import { TelemetryService } from "./telemetry.service";

@Controller()
export class TelemetryController {
  constructor(private readonly telemetry: TelemetryService) {}

  @Post("telemetry")
  ingest(@Body() body: unknown) {
    const reading = telemetryReadingSchema.parse(body);
    return this.telemetry.ingest(reading);
  }

  @Get("assets/:assetId/latest")
  latest(@Param("assetId") assetId: string) {
    return this.telemetry.latest(assetId);
  }

  @Get("incidents")
  incidents() {
    return this.telemetry.listIncidents();
  }
}
