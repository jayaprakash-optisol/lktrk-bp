import { eq } from 'drizzle-orm';
import { db } from '../config/database.config';
import { equipment } from '../models/equipment.schema';
import {
  IEquipmentService,
  EquipmentData,
  EquipmentQuery,
  ServiceResponse,
  EquipmentType,
} from '../types/interfaces';
import { v4 as uuidv4 } from 'uuid';
import {
  paginateAndFilter,
  nullToUndefined,
  buildFilterConditions,
  FilterCondition,
} from '../utils/pagination.util';
import { equipmentTypeEnum } from '../models/enums';

export class EquipmentService implements IEquipmentService {
  private static instance: EquipmentService;

  private constructor() {}

  public static getInstance(): EquipmentService {
    if (!EquipmentService.instance) {
      EquipmentService.instance = new EquipmentService();
    }
    return EquipmentService.instance;
  }

  /**
   * Map database equipment to EquipmentData
   */
  private mapEquipmentData(item: {
    id: string;
    equipmentName: string;
    equipmentType: EquipmentType;
    locationLatitude: number | null;
    locationLongitude: number | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
  }): EquipmentData {
    return {
      id: item.id,
      equipmentName: item.equipmentName,
      equipmentType: item.equipmentType,
      locationLatitude: nullToUndefined(item.locationLatitude),
      locationLongitude: nullToUndefined(item.locationLongitude),
      notes: nullToUndefined(item.notes),
    };
  }

  /**
   * Get all equipment with pagination and optional filtering
   */
  async getAllEquipment(query: EquipmentQuery): Promise<
    ServiceResponse<{
      equipment: EquipmentData[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    try {
      const { search, type } = query;

      // Build conditions using the filter builder
      const filters: FilterCondition[] = [
        {
          column: equipment.equipmentName,
          operator: 'like',
          value: search,
        },
        {
          column: equipment.equipmentType,
          operator: 'eq',
          value: type && equipmentTypeEnum.enumValues.includes(type) ? type : undefined,
        },
      ];

      const conditions = buildFilterConditions(filters);

      const paginationResult = await paginateAndFilter<EquipmentData, typeof equipment>(
        db,
        equipment,
        query,
        conditions,
        results => results.map(item => this.mapEquipmentData(item)),
      );

      return {
        success: true,
        message: 'Equipment retrieved successfully',
        data: {
          equipment: paginationResult.items,
          total: paginationResult.total,
          page: paginationResult.page,
          limit: paginationResult.limit,
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error('Error getting equipment:', error);
      return {
        success: false,
        message: 'Failed to retrieve equipment',
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
      };
    }
  }

  /**
   * Get equipment by ID
   */
  async getEquipmentById(id: string): Promise<ServiceResponse<EquipmentData>> {
    try {
      const result = await db.select().from(equipment).where(eq(equipment.id, id)).limit(1);

      if (result.length === 0) {
        return {
          success: false,
          message: 'Equipment not found',
          error: 'Equipment with the provided ID does not exist',
          statusCode: 404,
        };
      }

      const item = result[0];
      return {
        success: true,
        message: 'Equipment retrieved successfully',
        data: this.mapEquipmentData(item),
        statusCode: 200,
      };
    } catch (error) {
      console.error('Error getting equipment by ID:', error);
      return {
        success: false,
        message: 'Failed to retrieve equipment',
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
      };
    }
  }

  /**
   * Create new equipment
   */
  async createEquipment(data: EquipmentData): Promise<ServiceResponse<EquipmentData>> {
    try {
      const newId = uuidv4();

      const newEquipment = {
        id: newId,
        equipmentName: data.equipmentName,
        equipmentType: data.equipmentType,
        locationLatitude: data.locationLatitude ?? null,
        locationLongitude: data.locationLongitude ?? null,
        notes: data.notes ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.insert(equipment).values(newEquipment).returning();

      if (!result) {
        throw new Error('Failed to create equipment');
      }

      return {
        success: true,
        message: 'Equipment created successfully',
        data: this.mapEquipmentData(result[0]),
        statusCode: 201,
      };
    } catch (error) {
      console.error('Error creating equipment:', error);
      return {
        success: false,
        message: 'Failed to create equipment',
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
      };
    }
  }

  /**
   * Update equipment
   */
  async updateEquipment(
    id: string,
    data: Partial<EquipmentData>,
  ): Promise<ServiceResponse<EquipmentData>> {
    try {
      // Check if equipment exists
      const existingEquipment = await db
        .select()
        .from(equipment)
        .where(eq(equipment.id, id))
        .limit(1);

      if (existingEquipment.length === 0) {
        return {
          success: false,
          message: 'Equipment not found',
          error: 'Equipment with the provided ID does not exist',
          statusCode: 404,
        };
      }

      // Convert undefined values to null for database
      const dbData: Record<string, any> = {};

      if (data.equipmentName !== undefined) dbData.equipmentName = data.equipmentName;
      if (data.equipmentType !== undefined) dbData.equipmentType = data.equipmentType;
      if (data.locationLatitude !== undefined)
        dbData.locationLatitude = data.locationLatitude ?? null;
      if (data.locationLongitude !== undefined)
        dbData.locationLongitude = data.locationLongitude ?? null;
      if (data.notes !== undefined) dbData.notes = data.notes ?? null;

      const updateData = {
        ...dbData,
        updatedAt: new Date(),
      };

      await db.update(equipment).set(updateData).where(eq(equipment.id, id));

      // Get updated equipment
      const updatedEquipment = await db
        .select()
        .from(equipment)
        .where(eq(equipment.id, id))
        .limit(1);

      const item = updatedEquipment[0];
      return {
        success: true,
        message: 'Equipment updated successfully',
        data: this.mapEquipmentData(item),
        statusCode: 200,
      };
    } catch (error) {
      console.error('Error updating equipment:', error);
      return {
        success: false,
        message: 'Failed to update equipment',
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
      };
    }
  }

  /**
   * Delete equipment
   */
  async deleteEquipment(id: string): Promise<ServiceResponse<void>> {
    try {
      // Check if equipment exists
      const existingEquipment = await db
        .select()
        .from(equipment)
        .where(eq(equipment.id, id))
        .limit(1);

      if (existingEquipment.length === 0) {
        return {
          success: false,
          message: 'Equipment not found',
          error: 'Equipment with the provided ID does not exist',
          statusCode: 404,
        };
      }

      await db.delete(equipment).where(eq(equipment.id, id));

      return {
        success: true,
        message: 'Equipment deleted successfully',
        statusCode: 200,
      };
    } catch (error) {
      console.error('Error deleting equipment:', error);
      return {
        success: false,
        message: 'Failed to delete equipment',
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
      };
    }
  }
}
