import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RestaurantData,
  RestaurantDocument,
  RestaurantTableDocument,
  RESTAURANT_SCHEMA_NAME,
  EVENT_HUB,
  RestaurantTableStatus,
} from './restaurant.type';
import { ClientProxy } from '@nestjs/microservices';
import { Events } from 'src/app.type';

@Injectable()
export class RestaurantService {
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
