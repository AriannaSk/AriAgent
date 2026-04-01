export interface Resident {
  id: string;
  vards: string;
  uzvards: string;

  personasKods?: string;
  telefons?: string;
  epasts?: string;

  isOwner?: boolean;
}

export interface Apartment {

  id: string;
  numurs: number;
  stavs: number;
  istabuSkaits: number;

  iedzivotajuSkaits: number;
  pilnaPlatiba: number;
  dzivojamaPlatiba: number;

  majaId: string;

  lodzijasPlatiba: number   // NEW
  udensM3: number           // NEW

  iedzivotaji: Resident[];
}