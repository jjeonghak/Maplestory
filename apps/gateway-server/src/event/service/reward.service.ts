import { Injectable } from "@nestjs/common";
import { HttpClientService } from "src/global/service/httpClient.service";

@Injectable()
export class RewardService {
  private readonly REWARD_SERVER_URL = `${process.env.EVENT_SERVER_URL}/reward`;
  
  constructor(private readonly http: HttpClientService) {}

  async create(userId: string, body: any) {
    return this.http.post(`${this.REWARD_SERVER_URL}`, { userId, body })
  }

  async fetchAll(order: string, pageNumber: number, pageSize: number) {
    return this.http.get(`${this.REWARD_SERVER_URL}?order=${order}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  async fetchAllApplication(order: string, pageNumber: number, pageSize: number) {
    return this.http.get(`${this.REWARD_SERVER_URL}/application?order=${order}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  async fetchOne(id: string) {
    return this.http.get(`${this.REWARD_SERVER_URL}/${id}`);
  }

  async applyReward(userId: string, body: any) {
    return this.http.post(`${this.REWARD_SERVER_URL}/application`, { userId, body });
  }

  async processApplication(body: any) {
    return this.http.patch(`${this.REWARD_SERVER_URL}/application`, body);
  }

  async fetchAllByUserId(userId: string, order: string, pageNumber: number, pageSize: number) {
    return this.http.get(`${this.REWARD_SERVER_URL}/application/list?userId=${userId}&order=${order}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }
}