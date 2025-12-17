
export const UserRole = {
  Admin: 1,
  State: 2,
  District: 3,
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  AC_Sno: number;
  User_id: string;
  Name_Of_User: string;
  Display_Name: string;
  Designation: string;
  Dist_Code: number | null;
  Mobile_No: string | null;
  Email_id: string | null;
  Roll_id: number;
}

export interface District {
Dist_Sno: number;
Dist_Code: number;
Dist_Name_En: string;
Dist_Name_Hi: string;
Dist_Short_Name: string;
}

export interface Tehsil {
  Teh_Sno: number;
  Teh_Code: number;
  Dist_Code: number;
  Teh_Name_En: string;
  Teh_Name_Hi: string;
}

export interface Incident {
  Inc_id: number;
  Dist_Code: number;
  Teh_Code: number;
  DS_type_id: number;
  DS_Subtype_id: number | null;  
  DM_type_id: number | null;
  DM_Subtype_id: number | null;
  DM_Qty: number;  
  Inc_Month: number;
  Inc_Year: number;
  Is_Deleted: boolean;
  
  // Flood Relief Camp Info
  Camp_Name?: string;
  No_Of_Camps?: number;
  No_Of_Peoples?: number;
}

export interface MasterData {
  disasterTypes: { id: number; nameEn: string; nameHi: string }[];
  disasterSubtypes: { id: number; typeId: number; nameEn: string; nameHi: string }[];
  damageTypes: { 
    id: number; 
    nameEn: string; 
    nameHi: string;   
    UnitOfQty_En: string;
    UnitOfQty_Hi: string;
  }[];
  damageSubtypes: { id: number; typeId: number; nameEn: string; nameHi: string; UnitOfQty_En: string; UnitOfQty_Hi: string; }[];  
}
