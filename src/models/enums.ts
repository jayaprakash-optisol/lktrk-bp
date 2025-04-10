import { pgEnum } from 'drizzle-orm/pg-core';

export const moduleEnum = pgEnum('module', [
  'dashboard',
  'projects',
  'surveys',
  'calendar',
  'customers',
  'components',
  'equipments',
  'facility',
  'roles',
  'reports',
]);

export const facilityTypeEnum = pgEnum('facility_type', [
  'well_pads',
  'gas_processing_plants',
  'storage_terminals',
  'storage_tanks',
]);

export const operatingStatusEnum = pgEnum('operating_status', [
  'shutdown',
  'operating',
  'maintenance',
  'inoperative',
]);

export const componentTypeEnum = pgEnum('component_type', [
  'flange',
  'connector',
  'valve',
  'gauge',
  'meter',
]);

export const componentSubTypeEnum = pgEnum('component_sub_type', [
  'pump_casing',
  'flange_connection',
  'bearing_shaft',
  'compressor_seal',
  'ball_valve',
]);

export const accessLevelEnum = pgEnum('access_level', [
  'no_access',
  'view_access',
  'edit_access',
  'full_access',
]);

export const equipmentTypeEnum = pgEnum('equipment_type', [
  'storage_tank',
  'pipeline_piping',
  'vessel',
  'blower_fan',
]);

export const customerStatusEnum = pgEnum('customer_status', ['active', 'inactive']);

export const accessDifficultyNameEnum = pgEnum('access_difficulty_name', [
  'easy',
  'moderate',
  'difficult',
  'unsafe_without_equipment',
]);

export const serviceTypeNameEnum = pgEnum('service_type_name', [
  'ammonia',
  'btex',
  'condensate',
  'gas_methane',
  'lube_oil',
  'other',
]);

export const hazardTagNameEnum = pgEnum('hazard_tag_name', [
  'flammable',
  'hap',
  'corrosive',
  'pressurized',
  'voc',
]);

export const monitoringFrequencyNameEnum = pgEnum('monitoring_frequency_name', [
  'annual',
  'bimonthly',
  'monthly',
  'quarterly',
  'half_yearly',
  'daily',
  'weekly',
  'biweekly',
]);

export const regulationNameEnum = pgEnum('regulation_name', [
  '40_cfr_part_60',
  '40_cfr_part_61',
  '30_tac_chapter_115',
  'other',
]);

export const technologyNameEnum = pgEnum('technology_name', [
  'ogi',
  'pid',
  'fid',
  'tdlas',
  'cems',
  'other',
]);

export const surveyMethodNameEnum = pgEnum('survey_method_name', [
  'method_21',
  'ogi',
  'avo',
  'method_3',
  'method_16',
]);

export const surveyStatusEnum = pgEnum('survey_status', [
  'planned',
  'in_progress',
  'completed',
  'cancelled',
]);

export const surveyTypeNameEnum = pgEnum('survey_type_name', [
  'initial',
  'routine',
  'follow_up',
  'compliance',
]);

export const priorityNameEnum = pgEnum('priority_name', ['low', 'medium', 'high']);

export const zoneNameEnum = pgEnum('zone_name', [
  'Refrigeration Unit',
  'Storage Units',
  'Compression Unit',
  'Treating Unit',
  'Stabilization Unit',
  'Dehydration (Dehy)',
  'Processing unit',
]);
