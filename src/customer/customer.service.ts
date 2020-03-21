import { Injectable } from '@nestjs/common';
import {
  RestaurantReservationService,
  RestaurantService,
  RestaurantTableDocument,
} from 'src/restaurant';

@Injectable()
export class CustomerService {
  constructor(
    private readonly restaurantService: RestaurantService,
    private readonly reservationService: RestaurantReservationService,
  ) {}

  getDetails(name: string) {
    return this.restaurantService.getBySlug(name);
  }

  async requestSeats(restaurantSlug: string, pax: number) {
    // TODO: edge-case of paxNumber > total number of seat
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
        ? await this.reservationService.create(remainingPax)
        : null;

    return {
      confirmedTables,
      reservation,
    };
  }
}
