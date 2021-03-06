import { RESTAURANT_CONNECTION_NAME, WithId } from '@app/const';
import {
  createOwnerTestdata,
  createRestaurantAndLogin,
} from '@app/const/test-helper';
import { RestaurantTable } from '@app/restaurant-data/restaurant-data.type';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { OwnerModule } from './owner.module';

describe(`OwnerModule (e2e)`, () => {
  let mongod: MongoMemoryServer;
  let app: INestApplication;

  beforeEach(async () => {
    mongod = new MongoMemoryServer();
    app = await getApp(mongod);
  });

  afterEach(async () => {
    await app.close();
    await mongod.stop();
  });

  it(`can register and login`, async () => {
    expect.assertions(1);

    const httpServer = app.getHttpServer();

    const testData = createOwnerTestdata({ tableCount: 1 });

    await request(httpServer)
      .post('/owner')
      .send(testData)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(201);

    await request(httpServer)
      .post('/owner/login')
      .send({
        username: testData.username,
        password: testData.password,
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(201)
      .then((res) => {
        expect(res.body).toMatchInlineSnapshot(
          {
            access_token: expect.any(String),
          },
          `
            Object {
              "access_token": Any<String>,
            }
          `
        );
      });
  });

  it(`can make change to table status`, async () => {
    expect.assertions(1);

    const httpServer = app.getHttpServer();
    const agent = request.agent(httpServer);
    const result = await createRestaurantAndLogin(agent);

    const tableToUpdate = result.tables[0] as WithId<RestaurantTable>;

    await agent
      .put(`/owner/table/${result.slug}`)
      .send({
        tableId: tableToUpdate._id,
        status: 'occupied',
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${result.accessToken}`)
      .expect(200);

    const finalResult = await agent
      .get(`/owner/setting/${result.slug}`)
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => res.body);

    expect(finalResult.tables[0]).toHaveProperty('status', 'occupied');
  });

  it(`allows update of settings`, async () => {
    const httpServer = app.getHttpServer();
    const agent = request.agent(httpServer);
    const initialOwner = await createRestaurantAndLogin(agent, {
      name: 'KK Mart',
      tableCount: 4,
    });

    await agent
      .put(`/owner`)
      .send({
        slug: initialOwner.slug,
        name: 'Koko Mart',
        tables: initialOwner.tables,
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${initialOwner.accessToken}`)
      .expect(200);

    const finalResult = await agent
      .get(`/owner/setting/${initialOwner.slug}`)
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => res.body);

    expect(finalResult).toHaveProperty('name', 'Koko Mart');
  });
});

async function getApp(mongod: MongoMemoryServer) {
  const moduleFixture: TestingModule = await Test.createTestingModule({
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
        imports: [ConfigModule],
        useFactory: async () => {
          const uri = await mongod.getConnectionString();
          return {
            uri,
          };
        },
        connectionName: RESTAURANT_CONNECTION_NAME,
      }),
      OwnerModule,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();

  await app.init();

  return app;
}
