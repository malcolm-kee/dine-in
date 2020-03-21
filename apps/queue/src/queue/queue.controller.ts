import { CustomClientProxy, EventPayload, Events } from '@app/const';
import {
  RestaurantDataService,
  RestaurantReservationService,
  RestaurantTableDocument,
} from '@app/restaurant-data';
import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { EVENT_HUB } from './queue.type';

@Controller()
export class QueueController {
  constructor(
    @Inject(EVENT_HUB) private readonly client: ClientProxy,
    private readonly restaurantService: RestaurantDataService,
    private readonly reservationService: RestaurantReservationService,
  ) {}

  @EventPattern(Events.table_vacant)
  async fulfillNextInQueue(data: EventPayload['table_vacant']) {
    const nextReservation = await this.reservationService.getNextActiveItem(
      data.restaurant,
    );

    if (nextReservation) {
      const availableTables = await this.getVacantTables(
        data.restaurant,
        nextReservation.pax,
      );

      if (availableTables) {
        await Promise.all(
          availableTables.map(t =>
            this.restaurantService.occupyTable(
              data.restaurant,
              t._id.toString(),
            ),
          ),
        );

        await this.reservationService.closeReservation(nextReservation._id);

        (this.client as CustomClientProxy).emit('reservation_fulfilled', {
          id: nextReservation._id,
          restaurant: data.restaurant,
        });
      }
    }
  }

  private async getVacantTables(
    restaurant: string,
    requiredSeats: number,
  ): Promise<RestaurantTableDocument[] | null> {
    const restaurantDoc = await this.restaurantService.getBySlug(restaurant);

    let remainingSeats = requiredSeats;
    const result: RestaurantTableDocument[] = [];

    for (const table of restaurantDoc.tables) {
      if (table.status === 'vacant') {
        result.push(table);
        remainingSeats -= table.numberOfSeat;
      }
      if (remainingSeats <= 0) {
        return result;
      }
    }

    return null;
  }
}
