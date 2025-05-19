import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { RewardUserStatus } from "../enum/rewardUserStatus.enum";

export type RewardUserDocument = RewardUser & Document;

@Schema({ timestamps: true })
export class RewardUser {
  _id?: Types.ObjectId;
  
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  rewardId: string;

  @Prop({ required: true, default: RewardUserStatus.PENDING })
  status: RewardUserStatus;
}

export const RewardUserSchema = SchemaFactory.createForClass(RewardUser);