import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: console,
  });
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const port = 3000;
  await app.listen(port, () => {
    console.log(`dine-in api started at port ${port}`);
  });
}
bootstrap();
