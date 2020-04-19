import { EventPayload, Events } from '@app/const';
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { SocketGateway } from './socket.gateway';

@Controller()
export class SocketController {
  constructor(private readonly socketGateway: SocketGateway) {}

  @EventPattern(Events.setup_changed)
  notifySetupChanged(data: EventPayload['setup_changed']) {
    this.socketGateway.notifyEvent('setup_changed', data);
  }

  @EventPattern(Events.reservation_fulfilled)
  notifyFullfilledReservation(data: EventPayload['reservation_fulfilled']) {
    this.socketGateway.notifyEvent('reservation_fulfilled', data);
  }

  @EventPattern(Events.new_reservation)
  notifyNewReservation(data: EventPayload['new_reservation']) {
    this.socketGateway.notifyEvent('new_reservation', data);
  }

  @EventPattern(Events.table_occupied)
  notifyTableOccupied(data: EventPayload['table_occupied']) {
    this.socketGateway.notifyEvent('table_occupied', data);
  }

  @EventPattern(Events.table_vacant)
  notifyTableVacant(data: EventPayload['table_vacant']) {
    this.socketGateway.notifyEvent('table_vacant', data);
  }
}
