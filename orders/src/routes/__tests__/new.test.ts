import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

describe('Order creation', () => {
  it('Should return an error if the ticket does not exist', async () => {
    const ticketId = mongoose.Types.ObjectId();

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin())
      .send({
        ticketId,
      })
      .expect(404);
  });

  it('Should return an error if the ticket is already reserved', async () => {
    const ticket = Ticket.build({
      id: mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });
    await ticket.save();

    const order = Order.build({
      ticket,
      userId: 'sdsfsdfds',
      status: OrderStatus.Created,
      expiresAt: new Date(),
    });
    await order.save();

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin())
      .send({ ticket: ticket.id })
      .expect(400);
  });

  it('Should reserve a ticket', async () => {
    const ticket = Ticket.build({
      id: mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });
    await ticket.save();

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin())
      .send({ ticketId: ticket.id })
      .expect(201);
  });

  it('Should emit order created event', async () => {
    const ticket = Ticket.build({
      id: mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });
    await ticket.save();

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin())
      .send({ ticketId: ticket.id })
      .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
