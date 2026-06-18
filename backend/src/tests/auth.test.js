const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index');
// auth.test.js — fix line 4
const User = require('../models/User');  // ← this is actually correct (src/models)

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/schemeDB_test');
});

afterAll(async () => {
  await User.deleteMany({ email: /test_auth_/i });
  await mongoose.connection.close();
});

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test_auth_register@example.com',
      password: 'Test1234',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('test_auth_register@example.com');
  });

  it('should reject duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Dup User',
      email: 'test_auth_dup@example.com',
      password: 'Test1234',
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Dup User',
      email: 'test_auth_dup@example.com',
      password: 'Test1234',
    });
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject missing name', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test_auth_noname@example.com',
      password: 'Test1234',
    });
    expect(res.statusCode).toBe(400);
  });

  it('should reject invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bad Email',
      email: 'not-an-email',
      password: 'Test1234',
    });
    expect(res.statusCode).toBe(400);
  });

  it('should reject weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Weak Pass',
      email: 'test_auth_weak@example.com',
      password: 'abc',
    });
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login Test',
      email: 'test_auth_login@example.com',
      password: 'Test1234',
    });
  });

  it('should login with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test_auth_login@example.com',
      password: 'Test1234',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should reject wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test_auth_login@example.com',
      password: 'WrongPass',
    });
    expect(res.statusCode).toBe(401);
  });

  it('should reject non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'Test1234',
    });
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Me Test',
      email: 'test_auth_me@example.com',
      password: 'Test1234',
    });
    token = res.body.data.token;
  });

  it('should return user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe('test_auth_me@example.com');
  });

  it('should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('should reject invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken123');
    expect(res.statusCode).toBe(401);
  });
});