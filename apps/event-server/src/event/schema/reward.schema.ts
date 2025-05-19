import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { RewardType } from "../enum/rewardType.enum";

export type RewardDocument = Reward & Document;

@Schema({ timestamps: true })
export class Reward {
  _id?: Types.ObjectId;
  
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  eventId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startedAt: Date;

  @Prop({ required: true })
  expiredAt: Date;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: true })
  type: RewardType;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);