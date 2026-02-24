import { ApiProperty } from '@nestjs/swagger';

/**
 * Base HTTP response wrapper for all POST endpoints
 * Provides consistent response structure with status code
 */
export class BaseHttpResponse<T> {
  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Response data',
  })
  data: T;

  constructor(statusCode: number, data: T) {
    this.statusCode = statusCode;
    this.data = data;
  }
}
