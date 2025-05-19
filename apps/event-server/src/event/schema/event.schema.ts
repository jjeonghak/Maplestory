import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { EventType } from "../enum/eventType.enum";

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  _id?: Types.ObjectId;
  
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  type: EventType;

  @Prop({ required: true, default: true })
  active: boolean;

  @Prop({ required: true })
  startedAt: Date;

  @Prop({ required: true })
  expiredAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);