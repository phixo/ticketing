import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedEvent } from '@phixotickets/common';

import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 20,
  });
  await ticket.save();

  // Create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'Concert',
    price: 999,
    userId: mongoose.Types.ObjectId().toHexString(),
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { ticket, listener, data, msg };
};

describe('Ticket updated listener', () => {
  it('Should find, update and save a ticket', async () => {
    const { ticket, listener, data, msg } = await setup();

    // Call the onMessage method with the data and message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure a ticket was updated
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
  });

  it('Should ack the message', async () => {
    const { listener, data, msg } = await setup();

    // Call the onMessage method with the data and message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure ack function was called
    expect(msg.ack).toHaveBeenCalled();
  });

  it('Should not ack the message if the event has a skipped version number', async () => {
    const { listener, data, msg } = await setup();

    data.version = 10;

    // Call the onMessage method with the data and message object
    try {
      await listener.onMessage(data, msg);
    } catch (error) {}

    // Write assertions to make sure ack function was called
    expect(msg.ack).not.toHaveBeenCalled();
  });
});
