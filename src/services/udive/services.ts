export class UDiveServicesController {
  getUserRoles() {
    return ["registered", "translator", "superAdmin"];
  }
}
export const UDiveService = new UDiveServicesController();
