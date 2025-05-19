import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './account/schema/account.schema';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './account/service/auth.service';
import { AccountService } from './account/service/account.service';
import { AuthController } from './account/controller/auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'maplestory',
      signOptions: { expiresIn: '30m' }
    }),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    MongooseModule.forFeature([
      {name: Account.name, schema: AccountSchema}
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccountService],
})
export class AppModule {}
