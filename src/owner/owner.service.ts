import { Injectable } from '@nestjs/common';
import {
  RestaurantService,
  RestaurantData,
  RestaurantTable,
  RestaurantTableStatus,
  RestaurantTableDocument,
} from 'src/restaurant';
import { slugify } from 'src/lib/slugify';

@Injectable()
export class OwnerService {
  constructor(private readonly restaurantService: RestaurantService) {}

  register(data: Omit<RestaurantDataWithoutTableStatus, 'slug'>) {
    return this.restaurantService.create({
      ...data,
      slug: slugify(data.name),
      tables: data.tables.map(resetTableStatus),
    });
  }

  updateSetting(data: RestaurantDataWithoutTableStatus) {
    return this.restaurantService.update({
      ...data,
      tables: data.tables.map(resetTableStatus),
    });
  }

  getDetails(restaurantSlug: string) {
    return this.restaurantService.getBySlug(restaurantSlug);
  }

  async updateTableStatus(data: UpdateTableData) {
    const restaurantDoc = await this.getDetails(data.restaurantSlug);
    (restaurantDoc.tables as RestaurantTableDocument[]).forEach(table => {
      if (table._id.toString() === data.tableId) {
        table.status = data.status;
      }
    });

    return restaurantDoc.save();
  }
}

type TableWithoutStatus = Omit<RestaurantTable, 'status'>;

type RestaurantDataWithoutTableStatus = Omit<RestaurantData, 'tables'> & {
  tables: Array<TableWithoutStatus>;
};

const resetTableStatus = (table: TableWithoutStatus): RestaurantTable => ({
  ...table,
  status: 'vacant',
});

type UpdateTableData = {
  restaurantSlug: string;
  tableId: string;
  status: RestaurantTableStatus;
};
