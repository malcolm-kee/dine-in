import { Injectable } from '@nestjs/common';
import { RestaurantService, RestaurantData } from 'src/restaurant';

@Injectable()
export class CustomerService {
  constructor(private readonly restaurantService: RestaurantService) {}

  register(data: RestaurantData) {
    return this.restaurantService.create(data);
  }

  updateSetting(data: RestaurantData) {
    return this.restaurantService.update(data);
  }

  getDetails(name: string) {
    return this.restaurantService.getBySlug(name);
  }

  requestSeats(restaurantSlug: string, pax: number) {
    return this.restaurantService.requestSeats(restaurantSlug, pax);
  }
}
