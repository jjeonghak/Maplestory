import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { EventDocument } from "../schema/event.schema";
import { isValidObjectId, Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { EventType } from "../enum/eventType.enum";
import { PageResponseDto } from "src/global/dto/page.response.dto";
import { EventOverviewResponseDto } from "../dto/eventOverview.response.dto";
import { EventDetailsResponseDto } from "../dto/eventDetails.response.dto";

@Injectable()
export class EventService {
  constructor(@InjectModel(Event.name) private eventModel: Model<EventDocument>) {}

  async create(
      userId: string, 
      title: string, 
      description: string, 
      type: EventType, 
      startedAt: Date, 
      expiredAt: Date,
      active: boolean
  ) {
    const event = new this.eventModel({ userId, title, description, type, startedAt, expiredAt, active});
    return event.save();
  }

  async fetchAll(order: string, pageNumber: number, pageSize: number) {
    this.validateOrderAndPage(order, pageNumber, pageSize);

    const [docs, total] = await Promise.all([
      this.eventModel.find()
        .sort({ createdAt: order === 'ASC' ? 1 : -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .exec(),

      this.eventModel.countDocuments()
        .exec()
    ]);

    const dtos = docs.map((doc) => EventOverviewResponseDto.from(doc));
    return PageResponseDto.of(pageNumber, pageSize, total, dtos);
  }

  async fetchOne(id: string) {
    this.validateObjectId(id);
    
    const doc = await this.eventModel.findOne({ _id: id });
    return doc ? EventDetailsResponseDto.from(doc) : doc;
  }

  async fetchActiveAll(order: string, pageNumber: number, pageSize: number) {
    this.validateOrderAndPage(order, pageNumber, pageSize);

    const [docs, total] = await Promise.all([
      this.eventModel.find({ active: true })
        .sort({ createdAt: order === 'ASC' ? 1 : -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .exec(),

      this.eventModel.countDocuments({ active: true })
        .exec()
    ]);

    const dtos = docs.map((doc) => EventOverviewResponseDto.from(doc));
    return PageResponseDto.of(pageNumber, pageSize, total, dtos);
  }

  async fetchActiveOne(id: string) {
    this.validateObjectId(id);

    const doc = await this.eventModel.findOne({ _id: id });
    if (doc && !doc.active) {
      throw new ForbiddenException(`Access denied object id [${id}]`);
    }
    return doc ? EventDetailsResponseDto.from(doc) : doc;
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