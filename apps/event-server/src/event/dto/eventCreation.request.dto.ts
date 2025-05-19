import { IsBoolean, IsDate, IsEnum, IsNotEmpty, Length, ValidateNested } from "class-validator";
import { EventType } from "../enum/eventType.enum";
import { Type } from "class-transformer";
import { IsAfterDate, IsFutureDate } from "../../global/decorator/date.decorator";

export class CreationBodyDto {
  @IsNotEmpty({ message: 'Required event title' })
  @Length(1, 30, { message: 'Title must be between 1 and 30 characters' })
  title: string;

  @IsNotEmpty({ message: 'Required event description' })
  @Length(1, 2000, { message: 'Description must be between 1 and 2000 characters' })
  description: string;

  @IsEnum(EventType, { message: 'Required event type' })
  type: EventType;

  @IsDate({ message: 'Required event started date' })
  @IsFutureDate({ message: 'Started date must be a future date' })
  @Type(() => Date)
  startedAt: Date;

  @IsDate({ message: 'Required event expired date' })
  @IsAfterDate('startedAt', { message: 'Expired date must be after started date' })
  @Type(() => Date)
  expiredAt: Date;

  @IsBoolean({ message: 'Required event active' })
  active: boolean;
}

export class EventCreationRequestDto {
  @IsNotEmpty({ message: 'Required user id' })
  userId: string;

  @ValidateNested()
  @Type(() => CreationBodyDto)
  @IsNotEmpty({ message: 'Required event creation body' })
  body: CreationBodyDto;
}