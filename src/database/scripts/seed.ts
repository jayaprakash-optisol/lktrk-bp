import { user } from '../../models/user.schema';
import { role, roleModuleAccess, PREDEFINED_ROLES } from '../../models/role.schema';
import bcrypt from 'bcrypt';
import { logger } from '../../utils/logger';
import env from '../../config/env.config';
import { db } from '../../config/database.config';
import { v4 as uuidv4 } from 'uuid';
import { moduleEnum, accessLevelEnum } from '../../models/enums';

// Hash password function
const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, parseInt(env.BCRYPT_SALT_ROUNDS.toString(), 10));
};

// Insert roles
async function seedRoles() {
  try {
    const roleIds = {
      admin: uuidv4(),
      dba: uuidv4(),
      cto: uuidv4(),
      coo: uuidv4(),
      vp: uuidv4(),
      pm: uuidv4(),
    };

    const now = new Date();

    await db.insert(role).values([
      {
        id: roleIds.admin,
        name: 'Admin',
        description: 'Administrator with full access',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: roleIds.dba,
        name: 'DBA',
        description: PREDEFINED_ROLES.DBA,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: roleIds.cto,
        name: 'CTO',
        description: PREDEFINED_ROLES.CTO,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: roleIds.coo,
        name: 'COO',
        description: PREDEFINED_ROLES.COO,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: roleIds.vp,
        name: 'VP',
        description: PREDEFINED_ROLES.VP,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: roleIds.pm,
        name: 'PM',
        description: PREDEFINED_ROLES.PM,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    logger.info('✅ Roles seeded successfully');
    return roleIds;
  } catch (error) {
    logger.error('❌ Error seeding roles:', error);
    throw error;
  }
}

// Insert role module access permissions
async function seedRolePermissions(roleIds: Record<string, string>) {
  try {
    const now = new Date();
    const permissions = [];

    // Admin role - full access to everything
    moduleEnum.enumValues.forEach(module => {
      permissions.push({
        id: uuidv4(),
        roleId: roleIds.admin,
        module: module,
        accessLevel: 'full_access' as (typeof accessLevelEnum.enumValues)[number],
        createdAt: now,
        updatedAt: now,
      });
    });

    // DBA role - view most things, full access to specific modules
    ['dashboard', 'projects', 'surveys', 'customers', 'components', 'equipments'].forEach(
      module => {
        if (moduleEnum.enumValues.includes(module as (typeof moduleEnum.enumValues)[number])) {
          permissions.push({
            id: uuidv4(),
            roleId: roleIds.dba,
            module: module as (typeof moduleEnum.enumValues)[number],
            accessLevel: 'view_access' as (typeof accessLevelEnum.enumValues)[number],
            createdAt: now,
            updatedAt: now,
          });
        }
      },
    );

    // Project Manager role - full access to projects, view access to dashboard
    permissions.push(
      {
        id: uuidv4(),
        roleId: roleIds.pm,
        module: 'dashboard' as (typeof moduleEnum.enumValues)[number],
        accessLevel: 'view_access' as (typeof accessLevelEnum.enumValues)[number],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        roleId: roleIds.pm,
        module: 'projects' as (typeof moduleEnum.enumValues)[number],
        accessLevel: 'full_access' as (typeof accessLevelEnum.enumValues)[number],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        roleId: roleIds.pm,
        module: 'surveys' as (typeof moduleEnum.enumValues)[number],
        accessLevel: 'edit_access' as (typeof accessLevelEnum.enumValues)[number],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        roleId: roleIds.pm,
        module: 'customers' as (typeof moduleEnum.enumValues)[number],
        accessLevel: 'edit_access' as (typeof accessLevelEnum.enumValues)[number],
        createdAt: now,
        updatedAt: now,
      },
    );

    // CTO role
    permissions.push(
      {
        id: uuidv4(),
        roleId: roleIds.cto,
        module: 'dashboard' as (typeof moduleEnum.enumValues)[number],
        accessLevel: 'full_access' as (typeof accessLevelEnum.enumValues)[number],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        roleId: roleIds.cto,
        module: 'projects' as (typeof moduleEnum.enumValues)[number],
        accessLevel: 'full_access' as (typeof accessLevelEnum.enumValues)[number],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        roleId: roleIds.cto,
        module: 'surveys' as (typeof moduleEnum.enumValues)[number],
        accessLevel: 'full_access' as (typeof accessLevelEnum.enumValues)[number],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        roleId: roleIds.cto,
        module: 'components' as (typeof moduleEnum.enumValues)[number],
        accessLevel: 'full_access' as (typeof accessLevelEnum.enumValues)[number],
        createdAt: now,
        updatedAt: now,
      },
    );

    // COO role
    permissions.push(
      {
        id: uuidv4(),
        roleId: roleIds.coo,
        module: 'dashboard' as (typeof moduleEnum.enumValues)[number],
        accessLevel: 'view_access' as (typeof accessLevelEnum.enumValues)[number],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        roleId: roleIds.coo,
        module: 'customers' as (typeof moduleEnum.enumValues)[number],
        accessLevel: 'edit_access' as (typeof accessLevelEnum.enumValues)[number],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        roleId: roleIds.coo,
        module: 'projects' as (typeof moduleEnum.enumValues)[number],
        accessLevel: 'view_access' as (typeof accessLevelEnum.enumValues)[number],
        createdAt: now,
        updatedAt: now,
      },
    );

    // VP role
    permissions.push(
      {
        id: uuidv4(),
        roleId: roleIds.vp,
        module: 'dashboard' as (typeof moduleEnum.enumValues)[number],
        accessLevel: 'view_access' as (typeof accessLevelEnum.enumValues)[number],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        roleId: roleIds.vp,
        module: 'projects' as (typeof moduleEnum.enumValues)[number],
        accessLevel: 'edit_access' as (typeof accessLevelEnum.enumValues)[number],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        roleId: roleIds.vp,
        module: 'customers' as (typeof moduleEnum.enumValues)[number],
        accessLevel: 'edit_access' as (typeof accessLevelEnum.enumValues)[number],
        createdAt: now,
        updatedAt: now,
      },
    );

    await db.insert(roleModuleAccess).values(permissions);

    logger.info('✅ Role permissions seeded successfully');
  } catch (error) {
    logger.error('❌ Error seeding role permissions:', error);
    throw error;
  }
}

// Insert sample users
async function seedUsers(roleIds: Record<string, string>) {
  try {
    const hashedPassword = await hashPassword('Password123!');
    const now = new Date();

    await db.insert(user).values([
      {
        id: uuidv4(),
        email: 'admin@leaktrak.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '123-456-7890',
        roleId: roleIds.admin,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        email: 'pm@leaktrak.com',
        password: hashedPassword,
        firstName: 'Project',
        lastName: 'Manager',
        phoneNumber: '123-456-7891',
        roleId: roleIds.pm,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        email: 'cto@leaktrak.com',
        password: hashedPassword,
        firstName: 'Chief',
        lastName: 'Technology',
        phoneNumber: '123-456-7892',
        roleId: roleIds.cto,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        email: 'coo@leaktrak.com',
        password: hashedPassword,
        firstName: 'Chief',
        lastName: 'Operations',
        phoneNumber: '123-456-7893',
        roleId: roleIds.coo,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        email: 'vp@leaktrak.com',
        password: hashedPassword,
        firstName: 'Vice',
        lastName: 'President',
        phoneNumber: '123-456-7894',
        roleId: roleIds.vp,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    logger.info('✅ Users seeded successfully');
  } catch (error) {
    logger.error('❌ Error seeding users:', error);
    throw error;
  }
}

async function seed() {
  try {
    logger.info('🌱 Starting database seeding...');

    const roleIds = await seedRoles();
    await seedRolePermissions(roleIds);
    await seedUsers(roleIds);

    logger.info('✅ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();
