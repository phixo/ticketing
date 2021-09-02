import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

describe('Ticket update', () => {
  it('Should return a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', global.signin())
      .send({
        title: 'dsfdsfsdf',
        price: 20,
      })
      .expect(404);
  });

  it('Should return a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .send({
        title: 'dsfdsfsdf',
        price: 20,
      })
      .expect(401);
  });

  it('Should return a 401 if the user does not own the ticket', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: 'dsfdsfsdf',
        price: 20,
      });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', global.signin())
      .send({
        title: 'alskdjflskjdf',
        price: 1000,
      })
      .expect(401);
  });

  it('Should return a 400 if the user provides an invalid title or price', async () => {
    const cookie = global.signin();
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'dsfdsfsdf',
        price: 20,
      });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: '',
        price: 1000,
      })
      .expect(400);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'fdsfsdfsf',
        price: -10,
      })
      .expect(400);
  });

  it('Should update the ticket when the user provides valid inputs', async () => {
    const cookie = global.signin();
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'dsfdsfsdf',
        price: 20,
      });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'new title',
        price: 100,
      })
      .expect(200);

    const ticketResponse = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .send();

    expect(ticketResponse.body.title).toEqual('new title');
    expect(ticketResponse.body.price).toEqual(100);
  });

  it('Should publish an event', async () => {
    const cookie = global.signin();
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'dsfdsfsdf',
        price: 20,
      });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'new title',
        price: 100,
      })
      .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });

  it('Should reject updates if the ticket is reserved', async () => {
    const cookie = global.signin();
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'dsfdsfsdf',
        price: 20,
      });

    // Setting the orderId marks a ticket as reserved
    const ticket = await Ticket.findById(response.body.id);
    ticket?.set({ orderId: mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'new title',
        price: 100,
      })
      .expect(400);
  });
});
