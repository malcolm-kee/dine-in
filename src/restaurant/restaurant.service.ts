import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RestaurantData,
  RestaurantDocument,
  RestaurantTableDocument,
  RESTAURANT_SCHEMA_NAME,
} from './restaurant.type';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(RESTAURANT_SCHEMA_NAME)
    private readonly restaurantModel: Model<RestaurantDocument>,
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

    restaurant.tables = restaurantData.tables as RestaurantTableDocument[]; // mongoose will cast it correctly
    restaurant.name = restaurantData.name;

    return restaurant.save();
  }

  async occupyTable(slug: string, tableId: string) {
    const restaurant = await this.getBySlug(slug);
    const table = restaurant.tables.find(
      table => table._id.toString() === tableId,
    );

    if (table) {
      table.status = 'occupied';
      return restaurant.save();
    }
  }

  async releaseTable(slug: string, tableId: string) {
    const restaurant = await this.getBySlug(slug);
    const table = restaurant.tables.find(
      table => table._id.toString() === tableId,
    );

    if (table) {
      table.status = 'vacant';
      return restaurant.save();
    }
  }
}
