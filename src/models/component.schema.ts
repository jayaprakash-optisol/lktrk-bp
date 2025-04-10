import { pgTable, uuid, doublePrecision, text } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.schema';
import { relations } from 'drizzle-orm';
import {
  accessDifficultyNameEnum,
  monitoringFrequencyNameEnum,
  serviceTypeNameEnum,
  hazardTagNameEnum,
  componentTypeEnum,
  componentSubTypeEnum,
} from './enums';

// Main component table
export const component = pgTable('component', {
  ...baseColumns,
  componentSubType: componentSubTypeEnum('component_sub_type').notNull(),
  monitoringFrequency: monitoringFrequencyNameEnum('monitoring_frequency').notNull(),
  accessDifficulty: accessDifficultyNameEnum('access_difficulty').notNull(),
  locationLatitude: doublePrecision('location_latitude'),
  locationLongitude: doublePrecision('location_longitude'),
  notes: text('notes'),
});

// Junction table for component-type many-to-many relationship
export const componentTypeLink = pgTable('component_type_link', {
  ...baseColumns,
  componentId: uuid('component_id')
    .notNull()
    .references(() => component.id),
  componentType: componentTypeEnum('component_type').notNull(),
});

// Junction table for component-service-type many-to-many relationship
export const componentServiceType = pgTable('component_service_type', {
  ...baseColumns,
  componentId: uuid('component_id')
    .notNull()
    .references(() => component.id),
  serviceType: serviceTypeNameEnum('service_type').notNull(),
});

// Junction table for component-hazard-tag many-to-many relationship
export const componentHazardTag = pgTable('component_hazard_tag', {
  ...baseColumns,
  componentId: uuid('component_id')
    .notNull()
    .references(() => component.id),
  hazardTag: hazardTagNameEnum('hazard_tag').notNull(),
});

// Define relationships
export const componentRelations = relations(component, ({ many }) => ({
  // Many-to-many relationships
  componentTypes: many(componentTypeLink),
  componentServiceTypes: many(componentServiceType),
  componentHazardTags: many(componentHazardTag),
}));
