import { createRestaurantAndLogin } from '@app/const/test-helper';
import request from 'supertest';

const apiUrl = process.env.API_URL;

describe(`e2e`, () => {
  it(`works`, async () => {
    const agent = request.agent(apiUrl);
    const ownerDetails = await createRestaurantAndLogin(agent);

    const response = await new Promise((fulfill, reject) => {
      agent
        .get(`/owner/setting/${ownerDetails.slug}`)
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) return reject(err);

          fulfill(res.body);
        });
    });

    expect(response).toHaveProperty('name');
    expect(response).toHaveProperty('tables');
  });
});
