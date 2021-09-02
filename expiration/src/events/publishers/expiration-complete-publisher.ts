import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from '@phixotickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
