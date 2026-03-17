import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

const STUB_OPENAPI = {
  openapi: '3.0.0',
  info: {
    title: 'Survival Syndicate API',
    version: '0.1.0',
    description: 'Aggregated OpenAPI spec (stub)',
  },
  paths: {},
} as const;

@Controller()
@ApiTags('OpenAPI')
export class SwaggerAggregatorHttpController {
  @Get('openapi.json')
  @ApiOperation({ summary: 'Get aggregated OpenAPI specification' })
  @ApiResponse({ status: 200, description: 'OpenAPI 3.0 JSON document' })
  getOpenApi(): typeof STUB_OPENAPI {
    return { ...STUB_OPENAPI };
  }
}
