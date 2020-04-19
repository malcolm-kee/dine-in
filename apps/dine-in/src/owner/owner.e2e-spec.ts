import { RESTAURANT_CONNECTION_NAME, WithId } from '@app/const';
import { createOwnerTestdata } from '@app/const/test-helper';
import {
  RestaurantData,
  RestaurantTable,
} from '@app/restaurant-data/restaurant-data.type';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest, { SuperTest, Test as SuperTestTest } from 'supertest';
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

    const testData = createOwnerTestdata(1);

    await new Promise((fulfill, reject) => {
      supertest(httpServer)
        .post('/owner')
        .send(testData)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect(201)
        .end((err) => {
          if (err) return reject(err);
          fulfill();
        });
    });

    await new Promise((fulfill, reject) => {
      supertest(httpServer)
        .post('/owner/login')
        .send({
          username: testData.username,
          password: testData.password,
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect(201)
        .end((err, res) => {
          if (err) return reject(err);

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

          fulfill();
        });
    });
  });

  it(`can make change to table status`, async () => {
    expect.assertions(1);

    const httpServer = app.getHttpServer();
    const supertestTest = supertest(httpServer);
    const result = await simulateOwnerLogin(supertestTest);

    const tableToUpdate = result.tables[0] as WithId<RestaurantTable>;

    await new Promise((fulfill, reject) => {
      supertestTest
        .put(`/owner/table/${result.slug}`)
        .send({
          tableId: tableToUpdate._id,
          status: 'occupied',
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

    const finalResult = await new Promise<RestaurantData>((fulfill, reject) => {
      supertestTest
        .get(`/owner/setting/${result.slug}`)
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return reject(err);
          fulfill(res.body);
        });
    });

    expect(finalResult.tables[0]).toHaveProperty('status', 'occupied');
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

const simulateOwnerLogin = async (supertest: SuperTest<SuperTestTest>) => {
  const testData = createOwnerTestdata(3);

  const createResponse = await new Promise<RestaurantData>(
    (fulfill, reject) => {
      supertest
        .post('/owner')
        .send(testData)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          if (err) return reject(err);
          fulfill(res.body);
        });
    }
  );

  const accessToken = await new Promise((fulfill, reject) => {
    supertest
      .post('/owner/login')
      .send({
        username: testData.username,
        password: testData.password,
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .end((err, res) => {
        if (err) return reject(err);

        fulfill(res.body.access_token);
      });
  });

  return {
    ...testData,
    ...createResponse,
    accessToken,
  };
};
