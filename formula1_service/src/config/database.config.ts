import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST', 'f1-db'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'f1'),
  password: configService.get('DB_PASSWORD', 'f1'),
  database: configService.get('DB_DATABASE', 'f1'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: configService.get('NODE_ENV', 'development') === 'development',
}); 