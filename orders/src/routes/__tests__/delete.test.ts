import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

describe('Order list', () => {
  it('Should mark an order as cancelled', async () => {
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

    // Make a request to cancel the order
    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', user)
      .send()
      .expect(204);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  });

  it('Should emit order cancelled event', async () => {
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

    // Make a request to cancel the order
    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', user)
      .send()
      .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
