export interface PettyHolder {
  id: number;
  name: string;
  phoneNumber: string;

  // 🔥 Multi‑Select Cities
  cityIds: number[];
  cityNames: string[];

  regionId?: number;
  regionName?: string;

  isActive: boolean;

  cashBoxes: any[];
}
