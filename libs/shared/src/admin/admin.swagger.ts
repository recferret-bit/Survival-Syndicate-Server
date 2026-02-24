import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const ADMIN_API_KEY_NAME = 'admin-api-key';
export const ADMIN_AUTH = 'admin-auth';

export const AdminSwagger = (app: INestApplication): void => {
  const config = new DocumentBuilder()
    .setTitle('Admin swagger')
    .addSecurity(ADMIN_AUTH, {
      type: 'apiKey',
      in: 'header',
      name: ADMIN_API_KEY_NAME,
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/admin/docs', app, document);
};
