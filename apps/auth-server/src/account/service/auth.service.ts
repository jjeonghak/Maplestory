import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AccountService } from "./account.service";

@Injectable()
export class AuthService {

  private readonly ACCESS_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
  private readonly REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;

  constructor(
    private readonly jwtService: JwtService,
    private readonly accountService: AccountService
  ) {}

  async verify(accessToken: string) {
    try {
      const payload = this.jwtService.verify(accessToken, { secret: this.ACCESS_SECRET });
      return { payload };
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  async signin(account: any) {
    const payload = { id: account._id, email: account.email, role: account.role.toString() };
    const accessToken = this.jwtService.sign(payload, { secret: this.ACCESS_SECRET, expiresIn: '30m' });
    const refreshToken = this.jwtService.sign(payload, { secret: this.REFRESH_SECRET, expiresIn: '1d' });

    await this.accountService.saveRefreshToken(account._id, refreshToken);
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: this.REFRESH_SECRET });
      const account = await this.accountService.findByRefreshToken(refreshToken);
      if (!account || account._id.toString() !== payload.id) {
        throw new Error();
      }

      return this.signin(account);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}