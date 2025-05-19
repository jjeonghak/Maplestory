import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from './event/schema/event.schema';
import { Reward, RewardSchema } from './event/schema/reward.schema';
import { EventController } from './event/controller/event.controller';
import { EventService } from './event/service/event.service';
import { RewardController } from './event/controller/reward.controller';
import { RewardService } from './event/service/reward.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import Redlock from 'redlock';
import Redis from 'ioredis';
import { RewardUser, RewardUserSchema } from './event/schema/rewardUser.schema';

const redisClient = new Redis(process.env.REDIS_URI as string);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    MongooseModule.forFeature([
      {name: Event.name, schema: EventSchema},
      {name: Reward.name, schema: RewardSchema},
      {name: RewardUser.name, schema: RewardUserSchema},
    ]),
  ],
  controllers: [EventController, RewardController],
  providers: [
    EventService, 
    RewardService,
    {
      provide: 'REDIS_CLIENT',
      useValue: redisClient,
    },
    {
      provide: 'REDLOCK',
      useFactory: (client: Redis) => {
        return new Redlock([client], {
          retryCount: 3,
          retryDelay: 200,
        });
      },
      inject: ['REDIS_CLIENT'],
    },
  ],
})
export class AppModule {}
