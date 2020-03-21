import { RESTAURANT_CONNECTION_NAME, RESTAURANT_DB_URL } from '@app/const';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(RESTAURANT_DB_URL),
      }),
      inject: [ConfigService],
      connectionName: RESTAURANT_CONNECTION_NAME,
    }),
    QueueModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
