import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from '@phixotickets/common';

import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // Create a fake data event
  const data: TicketCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: 'Concert',
    price: 5,
    userId: mongoose.Types.ObjectId().toHexString(),
  };
  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

describe('Ticket created listener', () => {
  it('Should create and save a ticket', async () => {
    const { listener, data, msg } = await setup();

    // Call the onMessage method with the data and message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure a ticket was created
    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
  });

  it('Should ack the message', async () => {
    const { listener, data, msg } = await setup();

    // Call the onMessage method with the data and message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure ack function was called
    expect(msg.ack).toHaveBeenCalled();
  });
});
