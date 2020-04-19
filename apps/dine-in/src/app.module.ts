import { RESTAURANT_CONNECTION_NAME, RESTAURANT_DB_URL } from '@app/const';
import { LoggerMiddleware } from '@app/logger';
import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerModule } from './customer/customer.module';
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
    CustomerModule,
  ],
  providers: [Logger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('owner');
  }
}
