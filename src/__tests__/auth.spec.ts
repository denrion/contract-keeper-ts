import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app';
import connectMongoDB from '../config/connectMongoDB';
import User, { Role } from '../models/User';

describe('Test user authentication flow', () => {
  const adminUser = [
    {
      firstName: 'Admin',
      lastName: 'Account',
      email: 'admin@gmail.com',
      role: 'admin',
      password: 'test1234'
    }
  ];

  beforeAll(async () => {
    await connectMongoDB();
    await User.create(adminUser, { validateBeforeSave: false });
  });

  afterAll(async () => {
    await User.deleteMany({});
    mongoose.connection.close();
  });

  it('POST - /api/v1/auth/login - Login Admin', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@gmail.com', password: 'test1234' });

    const { status, data } = response.body;

    expect(data).toHaveProperty('token');
    expect(data).toHaveProperty('user');
    expect(data.user.role).toBe(Role.ADMIN);
    expect(status).toBe('success');
    expect(response.status).toBe(200);
  });

  it('POST - /api/v1/auth/login - Should not login with no credentials', done => {
    request(app)
      .post('/api/v1/auth/login')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
      });

    done();
  });

  it('POST - /api/v1/auth/login - Should not login with invalid credentials', done => {
    request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'sqdqsdq@gmail.com', password: '1234' })
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
      });

    done();
  });

  const newUser = {
    firstName: 'First',
    lastName: 'Last',
    email: 'test@gmail.com',
    password: 'test1234',
    passwordConfirm: 'test1234'
  };

  it('POST - /api/v1/auth/signup - Sign up', async () => {
    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send(newUser);

    const { status, data } = response.body;

    expect(status).toBe('success');
    expect(response.status).toBe(201);

    expect(data).toHaveProperty('token');
    expect(data).toHaveProperty('user');

    expect(data.user).toHaveProperty('id');
    expect(data.user.email).toBe(newUser.email);
  });

  it('POST - /api/v1/auth/login - Login User', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: newUser.email, password: newUser.password });

    const { status, data } = response.body;

    expect(data).toHaveProperty('token');
    expect(data).toHaveProperty('user');
    expect(data.user.role).toBe(Role.USER);

    expect(status).toBe('success');
    expect(response.status).toBe(200);
  });
});
