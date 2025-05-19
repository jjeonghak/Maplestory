import { RewardUser } from "../schema/rewardUser.schema";

export class RewardUserDetailsResponseDto {
  id: string;
  userId: string;
  rewardId: string;
  status: string;

  static from(rewardUser: RewardUser) {
    const dto = new RewardUserDetailsResponseDto();
    dto.id = rewardUser._id ? rewardUser._id.toString() : '';
    dto.userId = rewardUser.userId;
    dto.rewardId = rewardUser.rewardId;
    dto.status = rewardUser.status;
    return dto;
  }
}