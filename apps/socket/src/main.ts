import { REDIS_URL, WEBSOCKET_PORT } from '@app/const';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: console,
  });
  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      url: app.get(ConfigService).get(REDIS_URL),
    },
  });

  await app.startAllMicroservicesAsync();

  app.enableCors();
  app.useWebSocketAdapter(new WsAdapter(app));

  const PORT = app.get(ConfigService).get(WEBSOCKET_PORT) || 8080;

  await app.listen(PORT, () => {
    console.log(`socket started at port ${PORT}.`);
  });
}

bootstrap();
