import request from 'supertest';
import { app } from '../../app';

describe('Current user', () => {
  it('Should respond with details about the current user', async () => {
    const cookie = await global.signin();

    const response = await request(app)
      .get('/api/users/currentuser')
      .set('Cookie', cookie)
      .send()
      .expect(400);

    expect(response.body.currentUser.email).toEqual('test@test.com');
  });

  it('Should responds with null if not authenticated', async () => {
    const response = await request(app)
      .get('/api/users/currentuser')
      .send()
      .expect(200);

    expect(response.body.currentUser).toEqual(null);
  });
});
