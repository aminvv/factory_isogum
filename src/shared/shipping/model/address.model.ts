// ============================================================
// basket/model/address.model.ts
// ============================================================

export interface Address {
  id: number;
  province: string;
  city: string;
  street: string;
  postalCode: string;
  plaque?: string;
  isDefault: boolean;
}

export interface CreateAddressDto {
  province: string;
  city: string;
  street: string;
  postalCode: string;
  plaque?: string;
  isDefault?: boolean;
}