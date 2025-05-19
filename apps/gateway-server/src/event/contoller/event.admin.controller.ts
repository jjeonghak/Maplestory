import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { EventService } from "../service/event.service";
import { JwtAuthGuard } from "src/global/guard/jwtAuth.guard";
import { RoleGuard } from "src/global/guard/role.guard";
import { Roles } from "src/global/decorator/role.decorator";
import { Role } from "src/global/enum/role.enum";
import { AuthUser } from "src/global/decorator/authUser.decorator";

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('admin/event')
export class EventAdminController {
  constructor(private readonly eventService: EventService) {}

  @Roles(Role.ADMIN, Role.OPERATOR)
  @Post()
  async create(@AuthUser() admin: AuthUserPayload, @Body() body: any) {
    return this.eventService.create(admin.id, body);
  }

  @Roles(Role.ADMIN, Role.OPERATOR)
  @Get()
  async fetchAll(
    @Query('order') order: string, 
    @Query('pageNumber') pageNumber: number, 
    @Query('pageSize') pageSize: number
  ) {
    return this.eventService.fetchAll(order, pageNumber, pageSize);
  }

  @Roles(Role.ADMIN, Role.OPERATOR)
  @Get(':id')
  async fetchOne(@Param('id') id: string) {
    return this.eventService.fetchOne(id);
  }
}
