import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/global/guard/jwtAuth.guard";
import { RewardService } from "../service/reward.service";
import { AuthUser } from "src/global/decorator/authUser.decorator";

@UseGuards(JwtAuthGuard)
@Controller('reward')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Get()
  async fetchAll(
    @Query('order') order: string, 
    @Query('pageNumber') pageNumber: number, 
    @Query('pageSize') pageSize: number
  ) {
    return this.rewardService.fetchAll(order, pageNumber, pageSize);
  }

  @Get(':id')
  async fetchOne(@Param('id') id: string) {
    return this.rewardService.fetchOne(id);
  }

  @Post('application')
  async applyReward(@AuthUser() user: AuthUserPayload, @Body() body: any) {
    return this.rewardService.applyReward(user.id, body);
  }

  @Get('application/list')
  async fetchAllByUserId(
    @AuthUser() user: AuthUserPayload,
    @Query('order') order: string, 
    @Query('pageNumber') pageNumber: number, 
    @Query('pageSize') pageSize: number
  ) {
    return this.rewardService.fetchAllByUserId(user.id, order, pageNumber, pageSize);
  }
}