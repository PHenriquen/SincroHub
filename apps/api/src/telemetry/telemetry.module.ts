import { Module } from "@nestjs/common";
import { TelemetryController } from "./telemetry.controller";
import { TelemetryService } from "./telemetry.service";
import { OperationsModule } from "../operations/operations.module";

@Module({
  imports: [OperationsModule],
  controllers: [TelemetryController],
  providers: [TelemetryService],
  exports: [TelemetryService]
})
export class TelemetryModule {}
