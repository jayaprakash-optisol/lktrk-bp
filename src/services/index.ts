import { UserService } from './user.service';
import { CustomerService } from './customer.service';
import { ProjectService } from './project.service';
import { FacilityService } from './facility.service';
import { EquipmentService } from './equipment.service';
import { ComponentService } from './component.service';
import { SurveyService } from './survey.service';
import { createSingletonService } from '../utils/service.util';
import { AuthService } from './auth.service';

// Export singleton instances
export const userService = createSingletonService(UserService);
export const authService = createSingletonService(AuthService);
export const customerService = createSingletonService(CustomerService);
export const projectService = createSingletonService(ProjectService);
export const facilityService = createSingletonService(FacilityService);
export const equipmentService = createSingletonService(EquipmentService);
export const componentService = createSingletonService(ComponentService);
export const surveyService = createSingletonService(SurveyService);

// Export types
export {
  AuthService,
  UserService,
  CustomerService,
  ProjectService,
  FacilityService,
  EquipmentService,
  ComponentService,
  SurveyService,
};
