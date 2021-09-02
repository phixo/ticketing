import express, { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '@phixotickets/common';

import { Ticket } from '../models/ticket';

const router = express.Router();

router.get(
  '/api/tickets/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    res.send(ticket);
  },
);

export { router as showTicketRouter };
