import { Events, RESTAURANT_CONNECTION_NAME } from '@app/const';
import { EVENT_HUB } from '@app/restaurant-data/restaurant-data.type';
import { INestMicroservice } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientRedis } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { QueueModule } from './queue.module';

describe(`OwnerModule (e2e)`, () => {
  let mongod: MongoMemoryServer;
  let app: INestMicroservice;
  let client: ClientRedis;

  beforeEach(async () => {
    mongod = new MongoMemoryServer();
    app = await getApp(mongod);
    client = app.get(EVENT_HUB);
    await client.connect();
  });

  afterEach(async () => {
    await app.close();
    await mongod.stop();
    client.close();
  });

  test('that is useless', () => {
    client.emit(Events.table_vacant, {
      restaurant: 'restaurant',
      tableId: 'tableId',
    });
  });
});

async function getApp(mongod: MongoMemoryServer) {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        ignoreEnvVars: true,
      }),
      MongooseModule.forRootAsync({
        useFactory: async () => {
          const uri = await mongod.getConnectionString();
          return {
            uri,
          };
        },
        connectionName: RESTAURANT_CONNECTION_NAME,
      }),
      QueueModule,
    ],
  }).compile();

  const app = moduleFixture.createNestMicroservice({});

  await app.init();

  return app;
}
