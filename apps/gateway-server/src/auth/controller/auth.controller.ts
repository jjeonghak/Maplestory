import { Body, Controller, Delete, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "../service/auth.service";
import { AuthUser } from "src/global/decorator/authUser.decorator";
import { JwtAuthGuard } from "src/global/guard/jwtAuth.guard";


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: any) {
    return this.authService.signup(body);
  }

  @Post('signin')
  async signin(@Body() body: any) {
    return this.authService.signin(body);
  }

  @Patch('refresh')
  async refresh(@Body() body: any) {
    return this.authService.refresh(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('signout')
  async signout(@AuthUser() user: AuthUserPayload) {
    return this.authService.signout(user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('withdraw')
  async withdraw(@AuthUser() user: AuthUserPayload) {
    return this.authService.withdraw(user.id);
  }
}