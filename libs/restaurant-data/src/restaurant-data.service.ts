import { Events } from '@app/const';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EVENT_HUB,
  RestaurantData,
  RestaurantDocument,
  RestaurantTableDocument,
  RestaurantTableStatus,
  RESTAURANT_SCHEMA_NAME,
} from './restaurant-data.type';

@Injectable()
export class RestaurantDataService {
  constructor(
    @InjectModel(RESTAURANT_SCHEMA_NAME)
    private readonly restaurantModel: Model<RestaurantDocument>,
    @Inject(EVENT_HUB) private readonly client: ClientProxy,
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

    const latestData = await restaurant.save();

    this.client.emit(Events.setup_changed, { restaurant: restaurantData.slug });

    return latestData;
  }

  private async updateTable(
    slug: string,
    tableId: string,
    status: RestaurantTableStatus,
  ) {
    const restaurant = await this.getBySlug(slug);
    const table = restaurant.tables.find(
      table => table._id.toString() === tableId,
    );

    if (table) {
      table.status = status;
      const latestData = await restaurant.save();
      this.client.emit(
        status === 'occupied' ? Events.table_occupied : Events.table_vacant,
        { restaurant: slug, tableId },
      );
      return latestData;
    }
  }

  occupyTable(slug: string, tableId: string) {
    return this.updateTable(slug, tableId, 'occupied');
  }

  releaseTable(slug: string, tableId: string) {
    return this.updateTable(slug, tableId, 'vacant');
  }
}
