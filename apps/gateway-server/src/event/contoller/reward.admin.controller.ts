import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { RewardService } from "../service/reward.service";
import { RoleGuard } from "src/global/guard/role.guard";
import { JwtAuthGuard } from "src/global/guard/jwtAuth.guard";
import { Roles } from "src/global/decorator/role.decorator";
import { Role } from "src/global/enum/role.enum";
import { AuthUser } from "src/global/decorator/authUser.decorator";

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('admin/reward')
export class RewardAdminController {
  constructor(private readonly rewardService: RewardService) {}

  @Roles(Role.ADMIN, Role.OPERATOR)
  @Post()
  async create(@AuthUser() admin: AuthUserPayload, @Body() body: any) {
    return this.rewardService.create(admin.id, body);
  }

  @Roles(Role.ADMIN, Role.OPERATOR)
  @Get()
  async fetchAll(
    @Query('order') order: string, 
    @Query('pageNumber') pageNumber: number, 
    @Query('pageSize') pageSize: number
  ) {
    return this.rewardService.fetchAll(order, pageNumber, pageSize);
  }

  @Roles(Role.ADMIN, Role.OPERATOR, Role.AUDITOR)
  @Get('application')
  async fetchAllApplication(
    @Query('order') order: string, 
    @Query('pageNumber') pageNumber: number, 
    @Query('pageSize') pageSize: number
  ) {
    return this.rewardService.fetchAllApplication(order, pageNumber, pageSize);
  }

  @Roles(Role.ADMIN, Role.OPERATOR)
  @Get(':id')
  async fetchOne(@Param('id') id: string) {
    return this.rewardService.fetchOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch('application')
  async processApplication(@Body() body: any) {
    return this.rewardService.processApplication(body);
  }
}