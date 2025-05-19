import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/global/guard/jwtAuth.guard";
import { EventService } from "../service/event.service";

@UseGuards(JwtAuthGuard)
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async fetchActiveAll(
    @Query('order') order: string, 
    @Query('pageNumber') pageNumber: number, 
    @Query('pageSize') pageSize: number
  ) {
    return this.eventService.fetchActiveAll(order, pageNumber, pageSize);
  }

  @Get(':id')
  async fetchActiveOne(@Param('id') id: string) {
    return this.eventService.fetchActiveOne(id);
  }
}