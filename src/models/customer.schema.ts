import { pgTable, varchar, uuid, boolean } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.schema';
import { customerStatusEnum } from './enums';
import { contact } from './contact.schema';
import { relations } from 'drizzle-orm';

// Define the customer table
export const customer = pgTable('customer', {
  ...baseColumns,
  companyName: varchar('company_name').notNull(),
  parentCompanyId: uuid('parent_company_id'),
  officePhone: varchar('office_phone'),
  email: varchar('email'),
  address1: varchar('address1'),
  address2: varchar('address2'),
  city: varchar('city'),
  state: varchar('state'),
  zipCode: varchar('zip_code'),
  emailDomainMfa: varchar('email_domain_mfa'),
  cedriReportRequired: boolean('cedri_report_required'),
  status: customerStatusEnum('status').notNull(),
});

// Define relationships using Drizzle's relations helper
export const customerRelations = relations(customer, ({ many }) => ({
  // One-to-many relationship with contacts
  contacts: many(contact),
}));
