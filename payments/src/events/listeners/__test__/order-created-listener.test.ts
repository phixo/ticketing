import { OrderCreatedEvent, OrderStatus } from '@phixotickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { Order } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'dsdfds',
    userId: 'dsfdsfsd',
    status: OrderStatus.Created,
    version: 0,
    ticket: {
      id: 'fsdfds',
      price: 10,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

describe('Order created listener', () => {
  it('Should replicate order info', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order!.price).toEqual(data.ticket.price);
  });

  it('Should ack the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});
