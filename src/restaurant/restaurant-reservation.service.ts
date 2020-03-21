import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ReservationDocument,
  RESERVATION_SCHEMA_NAME,
} from './restaurant.type';

@Injectable()
export class RestaurantReservationService {
  constructor(
    @InjectModel(RESERVATION_SCHEMA_NAME)
    private readonly reservationModel: Model<ReservationDocument>,
  ) {}

  private async getNextQueueNum() {
    // TODO: potential race condition if multiple clients
    // don't bother about it for now as we have only one client
    const currentCount = await this.reservationModel.count({
      createdAt: {
        $gte: getStartOfToday(),
      },
    });

    return currentCount + 1;
  }

  async create(pax: number) {
    const queueNum = await this.getNextQueueNum();

    return this.reservationModel.create({
      status: 'active',
      queueNum,
      pax,
    });
  }

  getNextActiveItem() {
    return this.reservationModel
      .find({
        status: 'active',
      })
      .sort({
        createdAt: 'asc',
      })
      .limit(1)
      .exec()
      .then(docs => docs && docs[0]);
  }

  closeReservation(id: string) {
    return this.reservationModel
      .findByIdAndUpdate(id, {
        status: 'closed',
      })
      .exec();
  }
}

const getStartOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};
