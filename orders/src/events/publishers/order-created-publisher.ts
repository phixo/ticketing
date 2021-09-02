import { OrderCreatedEvent, Publisher, Subjects } from '@phixotickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
