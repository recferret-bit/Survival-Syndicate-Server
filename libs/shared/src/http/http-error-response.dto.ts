import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HttpErrorCode, HttpErrorType } from './http-error.enums';

export class HttpErrorResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 400 })
  statusCode: number;

  @ApiProperty({ enum: HttpErrorType, description: 'Error type' })
  errorType: HttpErrorType;

  @ApiProperty({ enum: HttpErrorCode, description: 'Error code' })
  errorCode: HttpErrorCode;

  @ApiProperty({ description: 'Error message' })
  message: string;

  @ApiPropertyOptional({ description: 'Error details' })
  details?: unknown;

  @ApiPropertyOptional({ description: 'Validation errors' })
  errors?: Array<{ field: string; message: string }>;

  @ApiPropertyOptional({ description: 'Timestamp in ISO format' })
  timestamp?: string;

  @ApiPropertyOptional({ description: 'Request path' })
  path?: string;
}
