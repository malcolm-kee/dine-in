/* istanbul ignore file */

import { RestaurantData } from '@app/restaurant-data/restaurant-data.type';
import type { SuperTest, Test } from 'supertest';

export const createOwnerTestdata = (tableCount: number) => {
  return {
    name: 'Malcolm Cafe',
    username: 'malcolm-kee',
    password: 'abc1234567',
    tables: Array.from({
      length: tableCount,
    }).map((_, index) => ({
      label: `T${index + 1}`,
      numberOfSeat: 5,
    })),
  };
};

export const createRestaurantAndLogin = async (test: SuperTest<Test>) => {
  const testData = createOwnerTestdata(3);

  const createResponse = await new Promise<RestaurantData>(
    (fulfill, reject) => {
      test
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

  const accessToken: string = await new Promise((fulfill, reject) => {
    test
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

export const waitForMs = (ms: number) =>
  new Promise((fulfill) => setTimeout(fulfill, ms));
