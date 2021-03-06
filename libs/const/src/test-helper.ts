/* istanbul ignore file */

import { RestaurantData } from '@app/restaurant-data/restaurant-data.type';
import type { SuperTest, Test } from 'supertest';

type CreateOwnerOptions = {
  name?: string;
  username?: string;
  password?: string;
  tables?: Array<{
    label: string;
    numberOfSeat: number;
  }>;
  tableCount?: number;
};

export const createOwnerTestdata = ({
  name = 'Malcolm Cafe',
  username = 'malcolm-kee',
  password = 'abc1234567',
  tableCount = 3,
  tables,
}: CreateOwnerOptions = {}) => {
  return {
    name,
    username,
    password,
    tables:
      tables ||
      Array.from({
        length: tableCount,
      }).map((_, index) => ({
        label: `T${index + 1}`,
        numberOfSeat: 5,
      })),
  };
};

export const createRestaurantAndLogin = async (
  agent: SuperTest<Test>,
  options?: CreateOwnerOptions
) => {
  const testData = createOwnerTestdata(options);

  const createResponse: RestaurantData = await agent
    .post('/owner')
    .send(testData)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .expect(201)
    .then((res) => res.body);

  const accessToken: string = await agent
    .post('/owner/login')
    .send({
      username: testData.username,
      password: testData.password,
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .then((res) => res.body.access_token);

  return {
    ...testData,
    ...createResponse,
    accessToken,
  };
};

export const waitForMs = (ms: number) =>
  new Promise((fulfill) => setTimeout(fulfill, ms));
