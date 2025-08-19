import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS - Modo desarrollo (más permisivo)
  app.enableCors({
    origin: true, // Permite cualquier origen en desarrollo
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
    ],
    credentials: true,
  });

  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: false,
  }));

  const config = new DocumentBuilder()
    .setTitle('Agenda Pro API')
    .setDescription('API para el sistema de gestión de citas y usuarios con roles')
    .setVersion('1.0')
    .addTag('Autenticación', 'Endpoints para registro y autenticación de usuarios')
    .addTag('Salud', 'Endpoints para verificar el estado del sistema')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('\n- 🚀 Swagger: http://localhost:3000/api');
}
bootstrap();