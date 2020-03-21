import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RESTAURANT_CONNECTION_NAME, RESTAURANT_DB_URL } from './app.type';
import { OwnerModule } from './owner/owner.module';

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
    OwnerModule,
  ],
  providers: [Logger],
})
export class AppModule {}
