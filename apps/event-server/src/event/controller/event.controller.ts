import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { EventService } from "../service/event.service";
import { EventCreationRequestDto } from "../dto/eventCreation.request.dto";

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Body() dto: EventCreationRequestDto) {
    const body = dto.body;
    return this.eventService.create(
      dto.userId, 
      body.title,
      body.description,
      body.type,
      body.startedAt,
      body.expiredAt,
      body.active
    );
  }

  @Get()
  async fetchAll(
    @Query('order') order: string, 
    @Query('pageNumber') pageNumber: number, 
    @Query('pageSize') pageSize: number
  ) {
    return this.eventService.fetchAll(order, pageNumber, pageSize);
  }

  @Get(':id')
  async fetchOne(@Param('id') id: string) {
    return this.eventService.fetchOne(id);
  }

  @Get('active')
  async fetchActiveAll(
    @Query('order') order: string, 
    @Query('pageNumber') pageNumber: number, 
    @Query('pageSize') pageSize: number
  ) {
    return this.eventService.fetchActiveAll(order, pageNumber, pageSize);
  }

  @Get('active/:id')
  async fetchActiveOne(@Param('id') id: string) {
    return this.eventService.fetchActiveOne(id);
  }
}