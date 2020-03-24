import { CustomClientProxy, Events } from '@app/const';
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

  async update(restaurantData: Omit<RestaurantData, 'ownerId'>) {
    const restaurant = await this.getBySlug(restaurantData.slug);

    restaurant.tables = restaurantData.tables as RestaurantTableDocument[]; // mongoose will cast it correctly
    restaurant.name = restaurantData.name;

    const latestData = await restaurant.save();

    (this.client as CustomClientProxy).emit(Events.setup_changed, {
      restaurant: restaurantData.slug,
    });

    return latestData;
  }

  private async updateTable(
    slug: string,
    tableId: string,
    status: RestaurantTableStatus,
  ) {
    const result = await this.restaurantModel.findOneAndUpdate(
      {
        slug,
        'tables._id': tableId,
      },
      {
        $set: {
          'tables.$.status': status,
        },
      },
      { new: true },
    );
    (this.client as CustomClientProxy).emit(
      status === 'occupied' ? Events.table_occupied : Events.table_vacant,
      { restaurant: slug, tableId },
    );
    return result;
  }

  occupyTable(slug: string, tableId: string) {
    return this.updateTable(slug, tableId, 'occupied');
  }

  releaseTable(slug: string, tableId: string) {
    return this.updateTable(slug, tableId, 'vacant');
  }
}
