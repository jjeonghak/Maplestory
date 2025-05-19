import { Injectable } from "@nestjs/common";
import { HttpClientService } from "src/global/service/httpClient.service";

@Injectable()
export class AuthService {
  private readonly AUTH_SERVER_URL = `${process.env.AUTH_SERVER_URL}/auth`;

  constructor(private readonly http: HttpClientService) {}

  async verifyToken(token: string) {
    return this.http.post(`${this.AUTH_SERVER_URL}/verify`, { token });
  }

  async signup(body: any) {
    return this.http.post(`${this.AUTH_SERVER_URL}/signup`, body);
  }

  async signin(body: any) {
    return this.http.post(`${this.AUTH_SERVER_URL}/signin`, body);
  }

  async refresh(body: any) {
    return this.http.patch(`${this.AUTH_SERVER_URL}/refresh`, body);
  }

  async signout(user: any) {
    return this.http.patch(`${this.AUTH_SERVER_URL}/signout`, user);
  }

  async withdraw(id: string) {
    return this.http.delete(`${this.AUTH_SERVER_URL}/withdraw/${id}`);
  }
}
