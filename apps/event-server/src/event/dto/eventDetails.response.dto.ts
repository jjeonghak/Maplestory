import { Event } from "../schema/event.schema";

export class EventDetailsResponseDto {
  id: string;
  title: string;
  description: string;
  type: string;
  active: boolean;
  startedAt: Date;
  expiredAt: Date;

  static from(event: Event) {
    const dto = new EventDetailsResponseDto();
    dto.title = event.title;
    dto.description = event.description;
    dto.type = event.type;
    dto.active = event.active;
    dto.startedAt = event.startedAt;
    dto.expiredAt = event.expiredAt;
    return dto;
  }
}