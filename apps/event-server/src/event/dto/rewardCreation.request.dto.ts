import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsPositive, Length, ValidateNested } from "class-validator";
import { IsAfterDate, IsFutureDate } from "src/global/decorator/date.decorator";
import { RewardType } from "../enum/rewardType.enum";

export class CreationBodyDto {
  @IsNotEmpty({ message: 'Required event id' })
  eventId: string;

  @IsNotEmpty({ message: 'Required reward title' })
  @Length(1, 30, { message: 'Title must be between 1 and 30 characters' })
  title: string;

  @IsNotEmpty({ message: 'Required reward description' })
  @Length(1, 2000, { message: 'Description must be between 1 and 2000 characters' })
  description: string;

  @IsDate({ message: 'Required reward started date' })
  @IsFutureDate({ message: 'Started date must be a future date' })
  @Type(() => Date)
  startedAt: Date;

  @IsDate({ message: 'Required reward expired date' })
  @IsAfterDate('startedAt', { message: 'Expired date must be after started date' })
  @Type(() => Date)
  expiredAt: Date;

  @IsPositive({ message: 'Quantity must be positive' })
  quantity: number;

  @IsEnum(RewardType, { message: 'Required role' })
  type: RewardType
}

export class RewardCreationRequestDto {
  @IsNotEmpty({ message: 'Required user id' })
  userId: string;

  @ValidateNested()
  @Type(() => CreationBodyDto)
  @IsNotEmpty({ message: 'Required reward creation body' })
  body: CreationBodyDto;
}