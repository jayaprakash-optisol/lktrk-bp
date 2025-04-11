import { ServiceResponse } from './common.interface';
import { PaginationParams } from '../../utils/pagination.util';
import { equipmentTypeEnum } from '../../models/enums';

// Define the equipment type as union of enum values
export type EquipmentType = (typeof equipmentTypeEnum.enumValues)[number];

export interface EquipmentData {
  id?: string;
  equipmentName: string;
  equipmentType: EquipmentType;
  locationLatitude?: number;
  locationLongitude?: number;
  notes?: string;
}

export interface EquipmentQuery extends PaginationParams {
  search?: string;
  type?: EquipmentType;
}

export interface IEquipmentService {
  getAllEquipment(query: EquipmentQuery): Promise<
    ServiceResponse<{
      equipment: EquipmentData[];
      total: number;
      page: number;
      limit: number;
    }>
  >;

  getEquipmentById(id: string): Promise<ServiceResponse<EquipmentData>>;

  createEquipment(data: EquipmentData): Promise<ServiceResponse<EquipmentData>>;

  updateEquipment(
    id: string,
    data: Partial<EquipmentData>,
  ): Promise<ServiceResponse<EquipmentData>>;

  deleteEquipment(id: string): Promise<ServiceResponse<void>>;
}
