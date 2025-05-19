import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { RewardService } from "../service/reward.service";
import { RewardCreationRequestDto } from "../dto/rewardCreation.request.dto";
import { RewardUserCreationRequestDto } from "../dto/rewardUserCreation.request.dto";
import { RewardUserProcessRequestDto } from "../dto/rewardUserProcess.request.dto";

@Controller('reward')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Post()
  async create(@Body() dto: RewardCreationRequestDto) {
    const body = dto.body;
    return this.rewardService.create(
      dto.userId,
      body.eventId,
      body.title,
      body.description,
      body.startedAt,
      body.expiredAt,
      body.quantity,
      body.type
    );
  }

  @Get()
  async fetchAll(
    @Query('order') order: string, 
    @Query('pageNumber') pageNumber: number, 
    @Query('pageSize') pageSize: number
  ) {
    return this.rewardService.fetchAll(order, pageNumber, pageSize);
  }

  @Get('application')
  async fetchAllApplication(
    @Query('order') order: string, 
    @Query('pageNumber') pageNumber: number, 
    @Query('pageSize') pageSize: number
  ) {
    return this.rewardService.fetchAllApplication(order, pageNumber, pageSize);
  }

  @Get(':id')
  async fetchOne(@Param('id') id: string) {
    return this.rewardService.fetchOne(id);
  }

  @Post('application')
  async applyReward(@Body() dto: RewardUserCreationRequestDto) {
    return this.rewardService.applyReward(dto.userId, dto.body.rewardId);
  }

  @Patch('application')
  async processApplication(@Body() body: RewardUserProcessRequestDto) {
    return this.rewardService.processApplication(body.id, body.approved);
  }

  @Get('application/list')
  async fetchAllByUserId(
    @Query('userId') userId: string,
    @Query('order') order: string, 
    @Query('pageNumber') pageNumber: number, 
    @Query('pageSize') pageSize: number
  ) {
    return this.rewardService.fetchAllByUserId(userId, order, pageNumber, pageSize);
  }

}