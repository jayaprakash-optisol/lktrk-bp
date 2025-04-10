import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './src/models',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process?.env?.DATABASE_URL || '',
  },
  verbose: true,
  strict: false,
} satisfies Config;
