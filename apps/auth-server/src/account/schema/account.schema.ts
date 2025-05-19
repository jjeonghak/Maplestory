import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Role } from "../enum/role.enum";

export type AccountDocument = Account & Document;

@Schema({ timestamps: true })
export class Account {
  _id?: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: Role.USER })
  role: Role;

  @Prop()
  refreshToken?: string;
}

export const AccountSchema = SchemaFactory.createForClass(Account);