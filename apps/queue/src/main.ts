import { REDIS_URL } from '@app/const';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      logger: console,
      transport: Transport.REDIS,
      options: {
        url: process.env[REDIS_URL],
      },
    },
  );

  app.listen(() => console.log(`Queue service is listening`));
}
bootstrap();
