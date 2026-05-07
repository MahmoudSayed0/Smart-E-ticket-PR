import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^https:\/\/.+\.vercel\.app$/,
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Smart E-Ticketing System API')
    .setDescription(
      'REST API for the Smart E-Ticketing System. ' +
        'Demonstrates Repository, Factory, and Strategy design patterns in NestJS.',
    )
    .setVersion('1.0.0')
    .addTag('events', 'Event management endpoints')
    .addTag('tickets', 'Ticket generation and redemption endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  console.log(`🎫 Smart E-Ticketing API running at http://localhost:${port}`);
  console.log(`📖 Swagger docs available at http://localhost:${port}/api-docs`);
}

bootstrap();
