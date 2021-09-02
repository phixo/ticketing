import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

import { natsWrapper } from '../../nats-wrapper';

describe('Ticket creation', () => {
  it('Should have a routehandler listening to /api/tickets for post requests', async () => {
    const response = await request(app).post('/api/tickets').send({});

    expect(response.status).not.toEqual(404);
  });

  it('Should only be accessible when a user is signed in', async () => {
    const response = await request(app).post('/api/tickets').send({});

    expect(response.status).toEqual(401);
  });

  it('Should return a status other than 401 when the user is signed in', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({});

    expect(response.status).not.toEqual(401);
  });

  it('Should return an error when an invalid title is provided', async () => {
    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({ title: '', price: 10 })
      .expect(400);

    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({ price: 10 })
      .expect(400);
  });

  it('Should return an error when an invalid price is provided', async () => {
    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({ title: 'Qwerty', price: -10 })
      .expect(400);

    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({ title: 'Qwerty' })
      .expect(400);
  });

  it('Should create a ticket with valid inputs', async () => {
    let tickets = await Ticket.find({});

    expect(tickets.length).toEqual(0);

    const title = 'Qwerty';
    const price = 10;

    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title,
        price,
      })
      .expect(201);

    tickets = await Ticket.find({});

    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(title);
    expect(tickets[0].price).toEqual(price);
  });

  it('Should publish an event', async () => {
    const title = 'Qwerty';
    const price = 10;

    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title,
        price,
      })
      .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
