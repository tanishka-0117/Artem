import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Question } from '../src/models/index.js';

describe('Question Routes', () => {
  beforeEach(async () => {
    await Question.deleteMany({});
  });

  it('GET /api/questions - should list questions with pagination', async () => {
    await Question.create([
      { title: 'Q1', description: 'Desc 1', category: 'Frontend', topic: 'React', difficulty: 'Easy' },
      { title: 'Q2', description: 'Desc 2', category: 'Backend', topic: 'Node', difficulty: 'Medium' },
    ]);

    const res = await request(app).get('/api/questions?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('GET /api/questions - should filter by category', async () => {
    await Question.create([
      { title: 'Q1', description: 'Desc 1', category: 'Frontend', topic: 'React', difficulty: 'Easy' },
      { title: 'Q2', description: 'Desc 2', category: 'Backend', topic: 'Node', difficulty: 'Medium' },
    ]);

    const res = await request(app).get('/api/questions?category=Frontend');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].category).toBe('Frontend');
  });
});
