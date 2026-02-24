// Request DTO (internal use)
export interface ValidateAdminApiKeyRequestDto {
  apiKey: string;
}

// Response DTO
export interface ValidateAdminApiKeyResponseDto {
  valid: boolean;
  adminId?: string;
  email?: string;
  reason?: 'not_found' | 'inactive';
}
