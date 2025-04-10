import { pgTable, varchar, uuid, timestamp, text } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.schema';
import { relations } from 'drizzle-orm';
import { monitoringFrequencyNameEnum, technologyNameEnum, surveyMethodNameEnum } from './enums';
import { customer } from './customer.schema';
import { facility } from './facility.schema';
import { component } from './component.schema';
import { equipment } from './equipment.schema';
import { regulation } from './regulation.schema';

// Main project table
export const project = pgTable('project', {
  ...baseColumns,
  projectName: varchar('project_name').notNull(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customer.id),
  regulationId: uuid('regulation_id')
    .notNull()
    .references(() => regulation.id),
  monitoringFrequency: monitoringFrequencyNameEnum('monitoring_frequency').notNull(),
  technology: technologyNameEnum('technology').notNull(),
  surveyMethod: surveyMethodNameEnum('survey_method').notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  notes: text('notes'),
});

// Junction table for project-facility many-to-many relationship
export const projectFacility = pgTable('project_facility', {
  ...baseColumns,
  projectId: uuid('project_id')
    .notNull()
    .references(() => project.id),
  facilityId: uuid('facility_id')
    .notNull()
    .references(() => facility.id),
});

// Junction table for project-component many-to-many relationship
export const projectComponent = pgTable('project_component', {
  ...baseColumns,
  projectId: uuid('project_id')
    .notNull()
    .references(() => project.id),
  componentId: uuid('component_id')
    .notNull()
    .references(() => component.id),
});

// Junction table for project-equipment many-to-many relationship
export const projectEquipment = pgTable('project_equipment', {
  ...baseColumns,
  projectId: uuid('project_id')
    .notNull()
    .references(() => project.id),
  equipmentId: uuid('equipment_id')
    .notNull()
    .references(() => equipment.id),
});

// Define relationships
export const projectRelations = relations(project, ({ one, many }) => ({
  // One-to-many relationship with customer
  customer: one(customer, {
    fields: [project.customerId],
    references: [customer.id],
  }),

  // One-to-one relationship with regulation
  regulation: one(regulation, {
    fields: [project.regulationId],
    references: [regulation.id],
  }),

  // Many-to-many relationships
  facilities: many(projectFacility),
  components: many(projectComponent),
  equipments: many(projectEquipment),
}));

// Define relationships for junction tables
export const projectFacilityRelations = relations(projectFacility, ({ one }) => ({
  project: one(project, {
    fields: [projectFacility.projectId],
    references: [project.id],
  }),
  facility: one(facility, {
    fields: [projectFacility.facilityId],
    references: [facility.id],
  }),
}));

export const projectComponentRelations = relations(projectComponent, ({ one }) => ({
  project: one(project, {
    fields: [projectComponent.projectId],
    references: [project.id],
  }),
  component: one(component, {
    fields: [projectComponent.componentId],
    references: [component.id],
  }),
}));

export const projectEquipmentRelations = relations(projectEquipment, ({ one }) => ({
  project: one(project, {
    fields: [projectEquipment.projectId],
    references: [project.id],
  }),
  equipment: one(equipment, {
    fields: [projectEquipment.equipmentId],
    references: [equipment.id],
  }),
}));
