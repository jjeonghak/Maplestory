import { Reward } from "../schema/reward.schema";

export class RewardOverviewResponseDto {
  id: string;
  title: string;
  startedAt: Date;
  expiredAt: Date;
  type: string;

  static from(reward: Reward) {
    const dto = new RewardOverviewResponseDto();
    dto.id = reward._id ? reward._id.toString() : '';
    dto.title = reward.title;
    dto.startedAt = reward.startedAt;
    dto.expiredAt = reward.expiredAt;
    dto.type = reward.type;
    return dto;
  }
}