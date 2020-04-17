import { REDIS_URL } from '@app/const';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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
  app.useGlobalPipes(new ValidationPipe());

  const options = new DocumentBuilder()
    .setTitle('Dine In Service')
    .setDescription('Dine In service API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  const port = app.get(ConfigService).get<string>('PORT') || 4000;
  await app.listen(port, () => {
    console.log(`dine-in api started at port ${port}`);
  });
}
bootstrap();
