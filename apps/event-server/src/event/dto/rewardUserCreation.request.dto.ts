import { Type } from "class-transformer";
import { IsNotEmpty, ValidateNested } from "class-validator";

export class CreationBodyDto {
  @IsNotEmpty({ message: 'Required reward id' })
  rewardId: string;
}

export class RewardUserCreationRequestDto {
  @IsNotEmpty({ message: 'Required user id'})
  userId: string;

  @ValidateNested()
  @Type(() => CreationBodyDto)
  @IsNotEmpty({ message: 'Required reward creation body' })
  body: CreationBodyDto;
}