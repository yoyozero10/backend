import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { WinstonLoggerService } from './common/logger';
import { HttpExceptionFilter } from './common/filters';
import { LoggingInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffer logs cho đến khi Winston sẵn sàng
  });

  // Sử dụng Winston làm logger mặc định
  const logger = app.get(WinstonLoggerService);
  app.useLogger(logger);

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Global exception filter - chuẩn hóa error response (lấy từ DI)
  app.useGlobalFilters(app.get(HttpExceptionFilter));

  // Global logging interceptor - log HTTP request/response (lấy từ DI)
  app.useGlobalInterceptors(app.get(LoggingInterceptor));

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  logger.log(`🚀 Server đang chạy tại http://localhost:${port}`, 'Bootstrap');
}
bootstrap();

