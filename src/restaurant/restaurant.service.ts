import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  RESTAURANT_SCHEMA_NAME,
  RestaurantDocument,
  RestaurantData,
} from './restaurant.type';
import { Model } from 'mongoose';

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

  getByName(restaurantName: string) {
    return this.restaurantModel
      .findOne({
        name: restaurantName,
      })
      .exec();
  }

  async update(restaurantData: RestaurantData) {
    const restaurant = await this.restaurantModel
      .findOne({
        name: restaurantData.name,
      })
      .exec();

    restaurant.tables = restaurantData.tables;

    return restaurant.save();
  }
}
