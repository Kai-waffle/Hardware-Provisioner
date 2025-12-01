export interface Station {
  id: number;
  hasPOS: boolean;
  hasCDS: boolean;
}

export interface Peripherals {
  stands: number;
  drawers: number;
  readers: number;
}

export interface Printers {
  receipt: number;
  kitchen: number;
  label: number;
}

export type PrinterType = 'receipt' | 'kitchen' | 'label';

export type LocationType =
  | 'front_of_house_counter'
  | 'back_of_house_kitchen'
  | 'back_of_house_expeditor'
  | 'bar'
  | 'back_office'
  | 'other';

export interface PrinterPlacement {
  type: PrinterType;
  location: LocationType | '';
  locationCustom?: string;
  stationId: string;
  canCable?: boolean;
  hasOutlet?: boolean;
  cableLength?: 5 | 10 | 15;
  distance?: 'under10' | 'over10';
}

export interface Infrastructure {
  hasInternet: boolean | null;
  routerLocation: string;
  hasPort: boolean | null;
  simProvider: string;
  simProviderOther: string;
}

export interface ProvisionerState {
  customerName: string;
  stations: Station[];
  peripherals: Peripherals;
  printers: Printers;
  printersPlacement: PrinterPlacement[];
  infrastructure: Infrastructure;
}

export interface NetworkEquipment {
  router: string;
  switch: string | null;
  cables: string | null;
}

export interface Complexity {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  time: string;
}

export interface NotionPageData {
  customerName: string;
  stations: Station[];
  peripherals: Peripherals;
  printers: PrinterPlacement[];
  networkEquipment: NetworkEquipment;
  complexity: Complexity;
  orderText: string;
}
