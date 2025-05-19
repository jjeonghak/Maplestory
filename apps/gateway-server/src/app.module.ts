import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth/service/auth.service';
import { AuthController } from './auth/controller/auth.controller';
import { HttpClientService } from './global/service/httpClient.service';
import { EventAdminController } from './event/contoller/event.admin.controller';
import { EventService } from './event/service/event.service';
import { JwtAuthGuard } from './global/guard/jwtAuth.guard';
import { RoleGuard } from './global/guard/role.guard';
import { EventController } from './event/contoller/event.controller';
import { RewardAdminController } from './event/contoller/reward.admin.controller';
import { RewardController } from './event/contoller/reward.controller';
import { RewardService } from './event/service/reward.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule
  ],
  controllers: [
    AuthController, 
    EventAdminController, 
    EventController, 
    RewardAdminController, 
    RewardController
  ],
  providers: [
    JwtAuthGuard, 
    RoleGuard, 
    AuthService, 
    EventService, 
    RewardService,
    HttpClientService,
  ]
})
export class AppModule {}
