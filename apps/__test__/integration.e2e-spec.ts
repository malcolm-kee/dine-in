import { RESTAURANT_CONNECTION_NAME, WithId } from '@app/const';
import { createRestaurantAndLogin, waitForMs } from '@app/const/test-helper';
import { RestaurantTable } from '@app/restaurant-data';
import { INestApplication, INestMicroservice } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { WsAdapter } from '@nestjs/platform-ws';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from 'supertest';
import WebSocket from 'ws';
import { CustomerModule } from '../dine-in/src/customer/customer.module';
import { OwnerModule } from '../dine-in/src/owner/owner.module';
import { QueueModule } from '../queue/src/queue/queue.module';
import { SocketModule } from '../socket/src/socket/socket.module';

describe(`Integration (e2e)`, () => {
  let mongod: MongoMemoryServer;
  let restApp: INestApplication;
  let queueApp: INestMicroservice;
  let socketApp: INestApplication;
  let socketClient: WebSocket;

  beforeEach(async () => {
    mongod = new MongoMemoryServer();
    [restApp, queueApp, socketApp] = await Promise.all([
      createRestApp(mongod),
      createQueueApp(mongod),
      createSocketApp(),
    ]);
  });

  afterEach(async () => {
    if (socketClient) {
      socketClient.close();
    }
    await Promise.all([restApp.close(), queueApp.close(), socketApp.close()]);
    await mongod.stop();
  });

  test(`integration tests`, async () => {
    const server = restApp.getHttpServer();
    const stest = supertest(server);
    const result = await createRestaurantAndLogin(stest);

    const { port } = socketApp.getHttpServer().listen().address();

    socketClient = await new Promise<WebSocket>((fulfill, reject) => {
      const client = new WebSocket(
        `ws://localhost:${port}?restaurant=${result.slug}`
      );
      client.onopen = () => fulfill(client);
      client.onerror = reject;
    });

    const seatPerTable = result.tables[0].numberOfSeat;

    const bookingsPax = [
      seatPerTable - 1,
      seatPerTable * 2 - 1,
      seatPerTable - 2,
      seatPerTable * 2 - 1,
    ];

    for (const pax of bookingsPax) {
      // simulate customer request seats
      await new Promise((fulfill, reject) => {
        stest
          .post(`/customer/${result.slug}`)
          .send({
            pax,
          })
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${result.accessToken}`)
          .expect(201)
          .end((err, res) => {
            if (err) return reject(err);
            fulfill(res.body);
          });
      });

      await waitForMs(250);
    }

    for (const table of result.tables as Array<WithId<RestaurantTable>>) {
      await new Promise((fulfill, reject) => {
        stest
          .put(`/owner/table/${result.slug}`)
          .send({
            tableId: table._id,
            status: 'vacant',
          })
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${result.accessToken}`)
          .expect(200)
          .end((err, res) => {
            if (err) return reject(err);
            fulfill(res.body);
          });
      });

      await waitForMs(250);
    }
  });
});

async function createRestApp(mongod: MongoMemoryServer) {
  const fixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        ignoreEnvVars: true,
        load: [
          () => ({
            JWT_SECRET: 'JWT_SECRET',
          }),
        ],
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
      OwnerModule,
      CustomerModule,
    ],
  }).compile();

  const app = fixture.createNestApplication();

  app.connectMicroservice({
    transport: Transport.REDIS,
  });

  await app.startAllMicroservicesAsync();

  await app.init();

  return app;
}

async function createQueueApp(mongod: MongoMemoryServer) {
  const fixture: TestingModule = await Test.createTestingModule({
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

  const app = await fixture.createNestMicroservice({
    transport: Transport.REDIS,
  });

  await app.listenAsync();

  return app;
}

async function createSocketApp() {
  const fixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        ignoreEnvVars: true,
      }),
      SocketModule,
    ],
  }).compile();

  const app = await fixture.createNestApplication();

  app.connectMicroservice({
    transport: Transport.REDIS,
  });

  await app.startAllMicroservicesAsync();

  app.useWebSocketAdapter(new WsAdapter(app));

  await app.init();

  return app;
}
