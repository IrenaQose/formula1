import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, VersioningType } from '@nestjs/common';
import { AppService } from './app.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS for both development and production
  const allowedOrigins =
    process.env.NODE_ENV === 'production' ? [process.env.FRONTEND_URL] : true;

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // This allows credentials to be sent with requests
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Formula 1 API')
    .setDescription('The Formula 1 API documentation')
    .setVersion('1.0')
    .addTag('seasons', 'Season management endpoints')
    .addTag('races', 'Race management endpoints')
    .addTag('drivers', 'Driver management endpoints')
    .addTag('constructors', 'Constructor team management endpoints')
    .addTag('results', 'Race results management endpoints')
    .addTag('standings', 'Driver standings management endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const appService = app.get(AppService);
  await appService.importAllData();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(
    `Swagger documentation is available at: http://localhost:${port}/api`,
  );
}
bootstrap();
