import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { AuthService } from "../service/auth.service";
import { AccountService } from "../service/account.service";
import { SignupRequestDto } from "../dto/signup.request.dto";
import { SigninRequestDto } from "../dto/signin.request.dto";
import { PayloadRequestDto } from "../dto/payload.request.dto";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly accountService: AccountService,
    private readonly authService: AuthService
  ) {}

  @Post('verify')
  async verify(@Body() body: { token: string }) {
    return this.authService.verify(body.token);
  }

  @Post('signup')
  async signup(@Body() body: SignupRequestDto) {
    const { email, password, role } = body;
    const account = await this.accountService.create(email, password, role);
    return this.authService.signin(account);
  }

  @Post('signin')
  async signin(@Body() body: SigninRequestDto) {
    const account = await this.accountService.validateAccount(body.email, body.password);
    return this.authService.signin(account);
  }

  @Patch('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  @Patch('signout')
  async signout(@Body() body: PayloadRequestDto) {
    await this.accountService.clearRefreshToken(body.id);
    return { success: true, message: 'Successfully sign out' };
  }

  @Delete('withdraw/:id')
  async withdraw(@Param('id') id: string) {
    await this.accountService.deleteAccount(id);
    return { success: true, message: 'Successfully remove account' };
  }
}