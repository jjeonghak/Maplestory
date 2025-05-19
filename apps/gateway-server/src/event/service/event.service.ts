import { Injectable } from "@nestjs/common";
import { HttpClientService } from "src/global/service/httpClient.service";

@Injectable()
export class EventService {
  private readonly EVENT_SERVER_URL = `${process.env.EVENT_SERVER_URL}/event`;

  constructor(private readonly http: HttpClientService) {}

  async create(userId: string, body: any) {
    return this.http.post(`${this.EVENT_SERVER_URL}`, { userId, body });
  }

  async fetchAll(order: string, pageNumber: number, pageSize: number) {
    return this.http.get(`${this.EVENT_SERVER_URL}?order=${order}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  async fetchOne(id: string) {
    return this.http.get(`${this.EVENT_SERVER_URL}/${id}`);
  }

  async fetchActiveAll(order: string, pageNumber: number, pageSize: number) {
    return this.http.get(`${this.EVENT_SERVER_URL}/active?order=${order}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  async fetchActiveOne(id: string) {
    return this.http.get(`${this.EVENT_SERVER_URL}/active/${id}`);
  }
}