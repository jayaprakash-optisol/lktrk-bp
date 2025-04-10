import { pgTable, varchar, uuid } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.schema';
import { customer } from './customer.schema';
import { relations } from 'drizzle-orm';

export const contact = pgTable('contact', {
  ...baseColumns,
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customer.id),
  officeNumber: varchar('office_number'),
  tceqSteersAccountNo: varchar('tceq_steers_account_no'),
  contactName: varchar('contact_name'),
  contactDesignation: varchar('contact_designation'),
  mobilePhone: varchar('mobile_phone'),
  email: varchar('email'),
});

// Define the relationship between contact and customer
export const contactRelations = relations(contact, ({ one }) => ({
  customer: one(customer, {
    fields: [contact.customerId],
    references: [customer.id],
  }),
}));
