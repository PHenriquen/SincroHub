import { Module } from "@nestjs/common";
import { AutomationsService } from "../automations/automations.service";
import { IncidentsService } from "../incidents/incidents.service";
import { OperationsController } from "./operations.controller";

@Module({
  controllers: [OperationsController],
  providers: [IncidentsService, AutomationsService],
  exports: [IncidentsService, AutomationsService]
})
export class OperationsModule {}
