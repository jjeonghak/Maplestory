import { IsBoolean, IsNotEmpty } from "class-validator";

export class RewardUserProcessRequestDto {
  @IsNotEmpty({ message: 'Required application id' })
  id: string;

  @IsBoolean({ message: 'Required approved' })
  approved: boolean;
}