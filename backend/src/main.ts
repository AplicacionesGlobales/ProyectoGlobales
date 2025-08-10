import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
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
