import { pgTable, varchar, uuid, doublePrecision, text } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.schema';
import { relations } from 'drizzle-orm';
import { facilityTypeEnum, operatingStatusEnum } from './enums';
import { customer } from './customer.schema';

// Main facility table
export const facility = pgTable('facility', {
  ...baseColumns,
  facilityName: varchar('facility_name').notNull(),
  facilityType: facilityTypeEnum('facility_type').notNull(),
  operatingStatus: operatingStatusEnum('operating_status').notNull(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customer.id),
  locationLatitude: doublePrecision('location_latitude'),
  locationLongitude: doublePrecision('location_longitude'),
  notes: text('notes'),
});

// Define relationships
export const facilityRelations = relations(facility, ({ one }) => ({
  // One-to-one relationships
  customer: one(customer, {
    fields: [facility.customerId],
    references: [customer.id],
  }),
}));
