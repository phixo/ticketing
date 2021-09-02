import { Ticket } from '../ticket';

describe('Ticket model', () => {
  it('Should implement optimistic concurrency control', async () => {
    // Create an instance of a ticket
    const ticket = Ticket.build({ title: 'concert', price: 5, userId: '123' });

    // Save the ticket to the database
    await ticket.save();

    // Fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    // Make two seperate changes to the fetched tickets
    firstInstance!.set({ price: 10 });
    secondInstance!.set({ price: 15 });

    // Save the first fetched ticket
    await firstInstance!.save();

    // Save the second fetched ticket and expect an error
    expect(async () => {
      await secondInstance!.save();
    }).rejects.toThrow();
  });

  it('Should increment the versionnumber on multiple saves', async () => {
    // Create an instance of a ticket
    const ticket = Ticket.build({ title: 'concert', price: 5, userId: '123' });
    await ticket.save();
    expect(ticket.version).toEqual(0);

    // Make first change
    ticket.set({ price: 10 });
    await ticket.save();
    expect(ticket!.version).toEqual(1);

    // Make second change
    ticket.set({ price: 15 });
    await ticket.save();
    expect(ticket!.version).toEqual(2);
  });
});
