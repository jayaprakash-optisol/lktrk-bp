import { pgTable, varchar, uuid, timestamp } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.schema';
import { relations } from 'drizzle-orm';
import {
  monitoringFrequencyNameEnum,
  surveyTypeNameEnum,
  priorityNameEnum,
  surveyMethodNameEnum,
  technologyNameEnum,
  zoneNameEnum,
} from './enums';
import { project } from './project.schema';
import { facility } from './facility.schema';
import { component } from './component.schema';
import { regulation } from './regulation.schema';
import { user } from './user.schema';

// Main survey table
export const survey = pgTable('survey', {
  ...baseColumns,
  customerName: varchar('customer_name').notNull(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => project.id),
  facilityId: uuid('facility_id')
    .notNull()
    .references(() => facility.id),
  zone: zoneNameEnum('zone').notNull(),
  regulationId: uuid('regulation_id')
    .notNull()
    .references(() => regulation.id),
  monitoringFrequency: monitoringFrequencyNameEnum('monitoring_frequency').notNull(),
  surveyType: surveyTypeNameEnum('survey_type').notNull(),
  priority: priorityNameEnum('priority').notNull(),
  surveyMethod: surveyMethodNameEnum('survey_method').notNull(),
  technology: technologyNameEnum('technology').notNull(),
  primaryTechnicianId: uuid('primary_technician_id')
    .notNull()
    .references(() => user.id),
  date: timestamp('date').notNull(),
  notes: varchar('notes'),
});

// Junction table for survey-component many-to-many relationship
export const surveyComponent = pgTable('survey_component', {
  ...baseColumns,
  surveyId: uuid('survey_id')
    .notNull()
    .references(() => survey.id),
  componentId: uuid('component_id')
    .notNull()
    .references(() => component.id),
});

// Junction table for survey-additional technicians many-to-many relationship
export const surveyTechnician = pgTable('survey_technician', {
  ...baseColumns,
  surveyId: uuid('survey_id')
    .notNull()
    .references(() => survey.id),
  technicianId: uuid('technician_id')
    .notNull()
    .references(() => user.id),
});

// Define relationships
export const surveyRelations = relations(survey, ({ one, many }) => ({
  project: one(project, {
    fields: [survey.projectId],
    references: [project.id],
  }),
  facility: one(facility, {
    fields: [survey.facilityId],
    references: [facility.id],
  }),
  regulation: one(regulation, {
    fields: [survey.regulationId],
    references: [regulation.id],
  }),
  primaryTechnician: one(user, {
    fields: [survey.primaryTechnicianId],
    references: [user.id],
  }),
  components: many(surveyComponent),
  additionalTechnicians: many(surveyTechnician),
}));

// Define relationships for junction tables
export const surveyComponentRelations = relations(surveyComponent, ({ one }) => ({
  survey: one(survey, {
    fields: [surveyComponent.surveyId],
    references: [survey.id],
  }),
  component: one(component, {
    fields: [surveyComponent.componentId],
    references: [component.id],
  }),
}));

export const surveyTechnicianRelations = relations(surveyTechnician, ({ one }) => ({
  survey: one(survey, {
    fields: [surveyTechnician.surveyId],
    references: [survey.id],
  }),
  technician: one(user, {
    fields: [surveyTechnician.technicianId],
    references: [user.id],
  }),
}));
