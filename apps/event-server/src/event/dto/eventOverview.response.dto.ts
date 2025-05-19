import { Event } from "../schema/event.schema";

export class EventOverviewResponseDto {
  id: string;
  title: string;
  active: boolean;
  startedAt: Date;
  expiredAt: Date;
  type: string;

  static from(event: Event) {
    const dto = new EventOverviewResponseDto();
    dto.id = event._id ? event._id.toString() : '';
    dto.title = event.title;
    dto.startedAt = event.startedAt;
    dto.expiredAt = event.expiredAt;
    dto.type = event.type;
    return dto;
  }
}