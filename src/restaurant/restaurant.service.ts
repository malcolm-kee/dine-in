import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RestaurantData,
  RestaurantDocument,
  RESTAURANT_SCHEMA_NAME,
  RestaurantTable,
} from './restaurant.type';
import { RestaurantReservationService } from './restaurant-reservation.service';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(RESTAURANT_SCHEMA_NAME)
    private readonly restaurantModel: Model<RestaurantDocument>,
    private readonly reservationService: RestaurantReservationService,
  ) {}

  create(restaurantData: RestaurantData) {
    const restaurant = new this.restaurantModel(restaurantData);
    return restaurant.save();
  }

  getBySlug(slug: string) {
    return this.restaurantModel
      .findOne({
        slug: slug,
      })
      .exec();
  }

  async update(restaurantData: RestaurantData) {
    const restaurant = await this.getBySlug(restaurantData.slug);

    restaurant.tables = restaurantData.tables;
    restaurant.name = restaurantData.name;

    return restaurant.save();
  }

  async requestSeats(slug: string, paxNumber: number) {
    // TODO: edge-case of paxNumber > total number of seat
    const restaurant = await this.getBySlug(slug);
    let remainingPax = paxNumber;
    const confirmedTables: RestaurantTable[] = [];

    for (const table of restaurant.tables) {
      if (remainingPax <= 0) {
        break;
      }

      if (table.status === 'vacant') {
        confirmedTables.push(table);
        remainingPax -= table.numberOfSeat;
        table.status = 'occupied';
      }
    }

    if (confirmedTables.length > 0) {
      await restaurant.save();
    }

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
