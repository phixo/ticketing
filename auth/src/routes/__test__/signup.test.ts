import request from 'supertest';
import { app } from '../../app';

describe('Signup', () => {
  it('Should return a 201 on succesful signup', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(201);
  });

  it('Should return a 400 with an invalid email', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'abcdef',
        password: 'password',
      })
      .expect(400);
  });

  it('Should return a 400 with an invalid password', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'p',
      })
      .expect(400);
  });

  it('Should return a 400 with missing email and password', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({ email: 'test@test.com' })
      .expect(400);

    await request(app)
      .post('/api/users/signup')
      .send({ password: 'password' })
      .expect(400);
  });

  it('Should disallow duplicate emails', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({ email: 'test@test.com', password: 'password' })
      .expect(201);

    await request(app)
      .post('/api/users/signup')
      .send({ email: 'test@test.com', password: 'password' })
      .expect(400);
  });

  it('Should set a cookie after succesful signup', async () => {
    const response = await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(201);

    expect(response.get('Set-Cookie')).toBeDefined();
  });
});
