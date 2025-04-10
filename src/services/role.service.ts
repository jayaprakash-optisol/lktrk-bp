import { eq } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import { db } from '../config/database.config';
import { role, roleModuleAccess } from '../models';
import { moduleEnum, accessLevelEnum } from '../models/enums';
import { ServiceResponse } from '../types';
import { createNotFoundError, createServiceResponse } from '../utils/response.util';
import { v4 as uuidv4 } from 'uuid';

export type ModuleAccess = {
  module: (typeof moduleEnum.enumValues)[number];
  accessLevel: (typeof accessLevelEnum.enumValues)[number];
};

export type RoleWithAccess = typeof role.$inferSelect & {
  moduleAccess: (typeof roleModuleAccess.$inferSelect)[];
};

export type NewRole = {
  name: string;
  description?: string;
  moduleAccess: ModuleAccess[];
};

export class RoleService {
  private static instance: RoleService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): RoleService {
    if (!RoleService.instance) {
      RoleService.instance = new RoleService();
    }
    return RoleService.instance;
  }

  /**
   * Create a new role with module access
   */
  async createRole(roleData: NewRole): Promise<ServiceResponse<RoleWithAccess>> {
    try {
      // Start a transaction
      return await db.transaction(async tx => {
        const roleId = uuidv4();
        const now = new Date();

        // First, create the role
        const newRole = await tx
          .insert(role)
          .values({
            id: roleId,
            name: roleData.name,
            description: roleData.description,
            createdAt: now,
            updatedAt: now,
            isDeleted: false,
          })
          .returning();

        if (!newRole.length) {
          throw new Error('Failed to create role');
        }

        // Then, add module access permissions
        const moduleAccessValues = roleData.moduleAccess.map(access => ({
          id: uuidv4(),
          roleId: newRole[0].id,
          module: access.module,
          accessLevel: access.accessLevel,
          createdAt: now,
          updatedAt: now,
          isDeleted: false,
        }));

        await tx.insert(roleModuleAccess).values(moduleAccessValues);

        // Get the complete role with module access
        const moduleAccessResult = await tx
          .select()
          .from(roleModuleAccess)
          .where(eq(roleModuleAccess.roleId, newRole[0].id));

        const result: RoleWithAccess = {
          ...newRole[0],
          moduleAccess: moduleAccessResult,
        };

        return createServiceResponse(true, result, undefined, StatusCodes.CREATED);
      });
    } catch (error) {
      return createServiceResponse<RoleWithAccess>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  /**
   * Get role by ID with module access
   */
  async getRoleById(roleId: string): Promise<ServiceResponse<RoleWithAccess>> {
    try {
      const roleResult = await db.select().from(role).where(eq(role.id, roleId)).limit(1);

      if (!roleResult.length) {
        throw createNotFoundError(`Role with ID ${roleId} not found`);
      }

      const moduleAccessResult = await db
        .select()
        .from(roleModuleAccess)
        .where(eq(roleModuleAccess.roleId, roleId));

      const result: RoleWithAccess = {
        ...roleResult[0],
        moduleAccess: moduleAccessResult,
      };

      return createServiceResponse(true, result);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as any).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<RoleWithAccess>(
        false,
        undefined,
        (error as Error).message,
        statusCode,
      );
    }
  }

  /**
   * Get all roles with module access
   */
  async getAllRoles(): Promise<ServiceResponse<RoleWithAccess[]>> {
    try {
      const roles = await db.select().from(role);

      const rolesWithAccess: RoleWithAccess[] = await Promise.all(
        roles.map(async r => {
          const moduleAccessResult = await db
            .select()
            .from(roleModuleAccess)
            .where(eq(roleModuleAccess.roleId, r.id));

          return {
            ...r,
            moduleAccess: moduleAccessResult,
          };
        }),
      );

      return createServiceResponse(true, rolesWithAccess);
    } catch (error) {
      return createServiceResponse<RoleWithAccess[]>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update role module access
   */
  async updateRoleModuleAccess(
    roleId: string,
    moduleAccess: ModuleAccess[],
  ): Promise<ServiceResponse<RoleWithAccess>> {
    try {
      return await db.transaction(async tx => {
        // Check if role exists
        const roleResult = await tx.select().from(role).where(eq(role.id, roleId)).limit(1);

        if (!roleResult.length) {
          throw createNotFoundError(`Role with ID ${roleId} not found`);
        }

        // Delete existing module access
        await tx.delete(roleModuleAccess).where(eq(roleModuleAccess.roleId, roleId));

        // Add new module access
        const now = new Date();
        const moduleAccessValues = moduleAccess.map(access => ({
          id: uuidv4(),
          roleId,
          module: access.module,
          accessLevel: access.accessLevel,
          createdAt: now,
          updatedAt: now,
          isDeleted: false,
        }));

        await tx.insert(roleModuleAccess).values(moduleAccessValues);

        // Get the updated role with module access
        const moduleAccessResult = await tx
          .select()
          .from(roleModuleAccess)
          .where(eq(roleModuleAccess.roleId, roleId));

        const result: RoleWithAccess = {
          ...roleResult[0],
          moduleAccess: moduleAccessResult,
        };

        return createServiceResponse(true, result);
      });
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as any).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<RoleWithAccess>(
        false,
        undefined,
        (error as Error).message,
        statusCode,
      );
    }
  }
}
