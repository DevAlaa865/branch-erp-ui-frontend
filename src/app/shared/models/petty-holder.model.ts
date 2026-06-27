export interface PettyHolder {
  id: number;
  name: string;
  phoneNumber: string;
  cityId: number;
  cityName: string;
  regionId?: number;
  regionName?: string;
  isActive: boolean;
  cashBoxes: any[];
}