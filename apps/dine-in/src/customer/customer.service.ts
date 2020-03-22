import {
  RestaurantDataService,
  RestaurantReservationService,
  RestaurantTableDocument,
} from '@app/restaurant-data';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomerService {
  constructor(
    private readonly restaurantService: RestaurantDataService,
    private readonly reservationService: RestaurantReservationService,
  ) {}

  getDetails(name: string) {
    return this.restaurantService.getBySlug(name);
  }

  async requestSeats(restaurantSlug: string, pax: number) {
    // TODO: edge-case of paxNumber > total number of seat
    const nextReservationInQueue = await this.reservationService.getNextActiveItem(
      restaurantSlug,
    );

    if (nextReservationInQueue) {
      return {
        confirmedTables: [],
        reservation: await this.reservationService.create(restaurantSlug, pax),
      };
    }

    const restaurant = await this.restaurantService.getBySlug(restaurantSlug);
    let remainingPax = pax;
    const confirmedTables: RestaurantTableDocument[] = [];

    for (const table of restaurant.tables) {
      if (remainingPax <= 0) {
        break;
      }

      if (table.status === 'vacant') {
        confirmedTables.push(table);
        remainingPax -= table.numberOfSeat;
      }
    }

    await Promise.all(
      confirmedTables.map(table =>
        this.restaurantService.occupyTable(
          restaurantSlug,
          table._id.toString(),
        ),
      ),
    );

    const reservation =
      remainingPax > 0
        ? await this.reservationService.create(restaurantSlug, remainingPax)
        : null;

    return {
      confirmedTables,
      reservation,
    };
  }
}
