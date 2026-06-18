const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Scheme = require('../models/Scheme');
const User = require('../models/User');

let adminToken;

const testScheme = {
    name_en: 'Test Health Scheme',
    name_mr: 'चाचणी आरोग्य योजना',
    ministry: 'Test Ministry',
    level: 'state',
    category: ['health'],
    eligibility: {
        age_min: 18, age_max: 60, gender: 'all',
        income_limit_annual: 100000, caste: ['all'],
    },
    benefit_description: 'Free health checkup for test users.',
    active: true,
};

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/schemeDB_test');

    // Create admin user and get token
    await User.deleteMany({ email: 'test_admin_schemes@example.com' });
    const adminUser = await User.create({
        name: 'Admin',
        email: 'test_admin_schemes@example.com',
        password: 'Admin1234',
        role: 'admin',
    });

    const res = await request(app).post('/api/auth/login').send({
        email: 'test_admin_schemes@example.com',
        password: 'Admin1234',
    });
    adminToken = res.body.data.token;

    // Insert test scheme
    await Scheme.deleteMany({ name_en: 'Test Health Scheme' });
    await Scheme.create(testScheme);
});

afterAll(async () => {
    await Scheme.deleteMany({ name_en: 'Test Health Scheme' });
    await User.deleteMany({ email: 'test_admin_schemes@example.com' });
    await mongoose.connection.close();
});

describe('GET /api/schemes', () => {
    it('should return list of schemes', async () => {
        const res = await request(app).get('/api/schemes');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data.schemes)).toBe(true);
    });

    it('should filter schemes by category', async () => {
        const res = await request(app).get('/api/schemes?category=health');
        expect(res.statusCode).toBe(200);
        res.body.data.schemes.forEach((s) => {
            expect(s.category).toContain('health');
        });
    });

    it('should return pagination info', async () => {
        const res = await request(app).get('/api/schemes?page=1&limit=5');
        expect(res.statusCode).toBe(200);
        expect(res.body.data.pagination).toHaveProperty('total');
        expect(res.body.data.pagination).toHaveProperty('totalPages');
    });
});

describe('POST /api/schemes/check — Eligibility Engine', () => {
    it('should return matched schemes for a valid profile', async () => {
        const res = await request(app).post('/api/schemes/check').send({
            age: 25,
            gender: 'female',
            annual_income: 80000,
            caste: 'obc',
            bpl: false,
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data.schemes)).toBe(true);
        expect(res.body.data).toHaveProperty('matched_count');
    });

    it('should reject request with invalid age', async () => {
        const res = await request(app).post('/api/schemes/check').send({
            age: 200,
            gender: 'female',
            caste: 'general',
        });
        expect(res.statusCode).toBe(400);
    });

    it('should reject request with missing age', async () => {
        const res = await request(app).post('/api/schemes/check').send({
            gender: 'male',
            caste: 'sc',
        });
        expect(res.statusCode).toBe(400);
    });

    it('should reject invalid gender value', async () => {
        const res = await request(app).post('/api/schemes/check').send({
            age: 30,
            gender: 'unknown',
            caste: 'general',
        });
        expect(res.statusCode).toBe(400);
    });

    it('should return only female schemes for female profile', async () => {
        const res = await request(app).post('/api/schemes/check').send({
            age: 35,
            gender: 'female',
            annual_income: 50000,
            caste: 'all',
        });
        expect(res.statusCode).toBe(200);
        res.body.data.schemes.forEach((s) => {
            expect(['female', 'all']).toContain(s.eligibility.gender);
        });
    });

    it('should filter by categories when provided', async () => {
        const res = await request(app).post('/api/schemes/check').send({
            age: 22,
            gender: 'all',
            caste: 'sc',
            categories: ['education'],
        });
        expect(res.statusCode).toBe(200);
        res.body.data.schemes.forEach((s) => {
            expect(s.category).toContain('education');
        });
    });
});

describe('GET /api/schemes/search', () => {
    it('should return results for a valid query', async () => {
        const res = await request(app).get('/api/schemes/search?q=health');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data.schemes)).toBe(true);
    });

    it('should reject empty query', async () => {
        const res = await request(app).get('/api/schemes/search?q=');
        expect(res.statusCode).toBe(400);
    });
});

describe('Admin scheme routes', () => {
    it('should reject scheme creation without auth', async () => {
        const res = await request(app).post('/api/schemes').send(testScheme);
        expect(res.statusCode).toBe(401);
    });

    it('should allow admin to create a scheme', async () => {
        const newScheme = { ...testScheme, name_en: 'Test Admin Created Scheme' };
        const res = await request(app)
            .post('/api/schemes')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(newScheme);
        expect(res.statusCode).toBe(201);
        expect(res.body.data.scheme.name_en).toBe('Test Admin Created Scheme');

        // cleanup
        await Scheme.deleteMany({ name_en: 'Test Admin Created Scheme' });
    });
});