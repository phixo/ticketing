import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

describe('Order list', () => {
  it('Should fetch the order', async () => {
    // Create ticket
    const ticket = Ticket.build({
      id: mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });
    await ticket.save();

    const user = global.signin();

    // Make a request to build an order with this ticket
    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(201);

    // Make a request to fetch the order
    const { body: fetchedOrder } = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', user)
      .send()
      .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
  });

  it('Should return an error is one user tries to fetch another users order', async () => {
    // Create ticket
    const ticket = Ticket.build({
      id: mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });
    await ticket.save();

    const user = global.signin();

    // Make a request to build an order with this ticket
    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(201);

    // Make a request to fetch the order with a different user
    await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', global.signin())
      .send()
      .expect(401);
  });
});
