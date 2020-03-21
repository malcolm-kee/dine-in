import { Injectable } from '@nestjs/common';
import { slugify } from 'src/lib/slugify';
import {
  RestaurantData,
  RestaurantService,
  RestaurantTable,
  RestaurantTableStatus,
} from 'src/restaurant';

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

  updateTableStatus(data: UpdateTableData) {
    if (data.status === 'vacant') {
      return this.restaurantService.releaseTable(
        data.restaurantSlug,
        data.tableId,
      );
    } else {
      return this.restaurantService.occupyTable(
        data.restaurantSlug,
        data.tableId,
      );
    }
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
