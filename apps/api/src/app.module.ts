import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { TelemetryModule } from "./telemetry/telemetry.module";
import { OperationsModule } from "./operations/operations.module";

@Module({
  imports: [OperationsModule, TelemetryModule],
  controllers: [HealthController]
})
export class AppModule {}
