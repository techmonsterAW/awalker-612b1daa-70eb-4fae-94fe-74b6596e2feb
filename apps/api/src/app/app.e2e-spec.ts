/**
 * E2E tests: Auth, RBAC, Tasks.
 * Requires DATABASE_URL (e.g. postgresql://localhost:5432/taskdb_test). Seed creates admin@example.com and viewer@other.org (password: password123).
 * Run with: DATABASE_URL=postgresql://... npx jest apps/api/src/app/app.e2e-spec.ts
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import request from 'supertest';

const hasDb = !!process.env['DATABASE_URL'];

describe('App (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    if (!hasDb) return;
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) await app.close();
  });

  const itOrSkip = hasDb ? it : it.skip;

  describe('Auth', () => {
    itOrSkip('POST /api/auth/login returns 200 and token for valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: 'password123' })
        .expect(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('admin@example.com');
      expect(res.body.user.role).toBe('admin');
      adminToken = res.body.accessToken;
    });

    itOrSkip('POST /api/auth/login returns 401 for invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: 'wrong' })
        .expect(401);
    });

    itOrSkip('GET /api/tasks without token returns 401', async () => {
      await request(app.getHttpServer()).get('/api/tasks').expect(401);
    });

    itOrSkip('GET /api/tasks with valid token returns 200', async () => {
      await request(app.getHttpServer())
        .get('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('RBAC', () => {
    beforeAll(async () => {
      if (!hasDb || !app) return;
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'viewer@other.org', password: 'password123' })
        .expect(200);
      viewerToken = res.body.accessToken;
    });

    itOrSkip('Viewer cannot POST /api/tasks (403)', async () => {
      await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ title: 'Test', status: 'todo', category: 'work' })
        .expect(403);
    });

    itOrSkip('Viewer cannot GET /api/audit-log (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/audit-log')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);
    });

    itOrSkip('Admin can GET /api/audit-log (200)', async () => {
      await request(app.getHttpServer())
        .get('/api/audit-log')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Tasks', () => {
    let taskId: string;

    it('Admin POST /api/tasks returns 201 and task body', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'E2E Task', description: 'From test', status: 'todo', category: 'work' })
        .expect(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('E2E Task');
      expect(res.body.organizationId).toBeDefined();
      taskId = res.body.id;
    });

    itOrSkip('GET /api/tasks returns only org-scoped tasks', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      const ids = res.body.map((t: { id: string }) => t.id);
      expect(ids).toContain(taskId);
    });

    itOrSkip('Admin PUT /api/tasks/:id updates task', async () => {
      await request(app.getHttpServer())
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated', status: 'in_progress' })
        .expect(200);
    });

    itOrSkip('Admin DELETE /api/tasks/:id returns 204', async () => {
      await request(app.getHttpServer())
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });
  });
});
