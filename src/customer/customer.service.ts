import { Injectable } from '@nestjs/common';
import { RestaurantService } from 'src/restaurant';

@Injectable()
export class CustomerService {
  constructor(private readonly restaurantService: RestaurantService) {}

  getDetails(name: string) {
    return this.restaurantService.getBySlug(name);
  }

  requestSeats(restaurantSlug: string, pax: number) {
    return this.restaurantService.requestSeats(restaurantSlug, pax);
  }
}
