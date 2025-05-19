import { Reward } from "../schema/reward.schema";

export class RewardDetailsResponseDto {
  id: string;
  eventId: string;
  title: string;
  description: string;
  startedAt: Date;
  expiredAt: Date;
  quantity: number;
  type: string;

  static from(reward: Reward) {
    const dto = new RewardDetailsResponseDto();
    dto.id = reward._id ? reward._id.toString() : '';
    dto.eventId = reward.eventId;
    dto.title = reward.title;
    dto.description = reward.description;
    dto.startedAt = reward.startedAt;
    dto.expiredAt = reward.expiredAt;
    dto.quantity = reward.quantity;
    dto.type = reward.type;
    return dto;
  }
}