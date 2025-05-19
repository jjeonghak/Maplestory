import { BadRequestException, ConflictException, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Reward, RewardDocument } from "../schema/reward.schema";
import { isValidObjectId, Model } from "mongoose";
import { RewardType } from "../enum/rewardType.enum";
import { EventDocument } from "../schema/event.schema";
import { RewardOverviewResponseDto } from "../dto/rewardOverview.response.dto";
import { PageResponseDto } from "src/global/dto/page.response.dto";
import { RewardDetailsResponseDto } from "../dto/rewardDetails.response.dto";
import Redlock from "redlock";
import { RewardUser, RewardUserDocument } from "../schema/rewardUser.schema";
import { RewardUserDetailsResponseDto } from "../dto/rewardUserDetails.response.dto";
import { RewardUserStatus } from "../enum/rewardUserStatus.enum";

@Injectable()
export class RewardService {
  constructor(
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(RewardUser.name) private rewardUserModel: Model<RewardUserDocument>,
    @Inject('REDLOCK') private readonly redlock: Redlock
  ) {}

  async create(
    userId: string,
    eventId: string,
    title: string,
    description: string,
    startedAt: Date,
    expiredAt: Date,
    quantity: number,
    type: RewardType
  ) {
    this.validateObjectId(eventId);
    const event = await this.eventModel.findOne({ _id: eventId });
    if (!event) {
      throw new BadRequestException(`Invalid event id [${eventId}]`);
    }

    const reward = new this.rewardModel({ userId, eventId, title, description, startedAt, expiredAt, quantity, type });
    return reward.save();
  }

  async fetchAll(order: string, pageNumber: number, pageSize: number) {
    this.validateOrderAndPage(order, pageNumber, pageSize);

    const [docs, total] = await Promise.all([
      this.rewardModel.find()
        .sort({ createdAt: order === 'ASC' ? 1 : -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .exec(),

      this.rewardModel.countDocuments()
        .exec()
    ]);

    const dtos = docs.map((doc) => RewardOverviewResponseDto.from(doc));
    return PageResponseDto.of(pageNumber, pageSize, total, dtos);
  }

  async fetchAllApplication(order: string, pageNumber: number, pageSize: number) {
    this.validateOrderAndPage(order, pageNumber, pageSize);

    const [docs, total] = await Promise.all([
      this.rewardUserModel.find()
        .sort({ createdAt: order === 'ASC' ? 1 : -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .exec(),

      this.rewardUserModel.countDocuments()
        .exec()
    ]);

    const dtos = docs.map((doc) => RewardUserDetailsResponseDto.from(doc));
    return PageResponseDto.of(pageNumber, pageSize, total, dtos);
  }

  async fetchOne(id: string) {
    this.validateObjectId(id);
    
    const doc = await this.rewardModel.findOne({ _id: id });
    return doc ? RewardDetailsResponseDto.from(doc) : doc;
  }

  async applyReward(userId: string, rewardId: string) {
    this.validateObjectId(rewardId);
    const reward = await this.rewardModel.findOne({ _id: rewardId });
    if (!reward) {
      throw new BadRequestException(`Invalid reward id [${rewardId}]`);
    }

    const lock = await this.redlock.acquire([`locks:${userId}-${rewardId}`], 1000);
    try {
      if (await this.rewardUserModel.exists({ userId, rewardId })) {
        throw new ConflictException(`Already existed user and reward id [${userId}] [${rewardId}]`);
      }
      
      const rewardUser = new this.rewardUserModel({ userId, rewardId });
      return rewardUser.save();
    } finally {
      await lock.release();
    }
  }

  async processApplication(id: string, approved: boolean) {
    this.validateObjectId(id);
    if (!await this.rewardUserModel.exists({ _id: id, status: RewardUserStatus.PENDING })) {
      throw new BadRequestException(`Invalid application id [${id}]`);
    }

    return this.rewardUserModel.findByIdAndUpdate(id, { status: approved ? RewardUserStatus.APPROVED : RewardUserStatus.REJECTED });
  }

  async fetchAllByUserId(userId: string, order: string, pageNumber: number, pageSize: number) {
    this.validateOrderAndPage(order, pageNumber, pageSize);

    const [docs, total] = await Promise.all([
      this.rewardUserModel.find({ userId })
        .sort({ createdAt: order === 'ASC' ? 1 : -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .exec(),

      this.rewardUserModel.countDocuments({ userId })
        .exec()
    ]);

    const dtos = docs.map((doc) => RewardUserDetailsResponseDto.from(doc));
    return PageResponseDto.of(pageNumber, pageSize, total, dtos);
  }
  
  private validateObjectId(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid object id [${id}]`);
    }
  }

  private validateOrderAndPage(order: string, pageNumber: number, pageSize: number) {
    if (order !== 'ASC' && order !== 'DESC') {
      throw new BadRequestException('Invalid query parameter order');
    }
    if (pageNumber < 1 || pageSize < 1) {
      throw new BadRequestException('Invalid query parameter page');
    }
  }
}