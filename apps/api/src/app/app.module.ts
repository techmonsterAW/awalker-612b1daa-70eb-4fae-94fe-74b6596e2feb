import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { Organization, User, Task, AuditLog } from './entities';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import { TasksModule } from './tasks/tasks.module';
import { AuditModule } from './audit/audit.module';
import { JwtAuthGuard } from './auth/auth.guard';

function getTypeOrmOptions() {
  const url = process.env['DATABASE_URL'];
  if (!url) {
    return {
      type: 'postgres' as const,
      url: 'postgresql://localhost:5432/taskdb',
      entities: [Organization, User, Task, AuditLog],
      synchronize: process.env['NODE_ENV'] !== 'production',
      logging: process.env['NODE_ENV'] === 'development',
    };
  }
  try {
    const u = new URL(url);
    const host = u.hostname === 'localhost' ? '127.0.0.1' : u.hostname;
    return {
      type: 'postgres' as const,
      host,
      port: parseInt(u.port || '5432', 10),
      username: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password || ''),
      database: u.pathname.slice(1) || 'taskdb',
      entities: [Organization, User, Task, AuditLog],
      synchronize: process.env['NODE_ENV'] !== 'production',
      logging: process.env['NODE_ENV'] === 'development',
    };
  } catch {
    return {
      type: 'postgres' as const,
      url,
      entities: [Organization, User, Task, AuditLog],
      synchronize: process.env['NODE_ENV'] !== 'production',
      logging: process.env['NODE_ENV'] === 'development',
    };
  }
}

@Module({
  imports: [
    TypeOrmModule.forRoot(getTypeOrmOptions()),
    AuthModule,
    SeedModule,
    TasksModule,
    AuditModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
