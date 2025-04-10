import { pgTable, varchar, doublePrecision, text } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.schema';
import { equipmentTypeEnum } from './enums';

// Main equipment table
export const equipment = pgTable('equipment', {
  ...baseColumns,
  equipmentName: varchar('equipment_name').notNull(),
  equipmentType: equipmentTypeEnum('equipment_type').notNull(),
  locationLatitude: doublePrecision('location_latitude'),
  locationLongitude: doublePrecision('location_longitude'),
  notes: text('notes'),
});
