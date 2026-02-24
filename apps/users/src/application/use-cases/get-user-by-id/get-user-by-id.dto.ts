// Request DTO (internal use)
export interface GetUserByIdRequestDto {
  userId: string;
}

// Response DTO
export interface GetUserByIdResponseDto {
  userId: string;
  userEmail?: string;
  phone?: string;
  isTest: boolean;
  banned: boolean;
  country: string;
  currencyIsoCode?: string;
}
