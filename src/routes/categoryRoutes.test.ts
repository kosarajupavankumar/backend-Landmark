import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import categoryRoutes from '../routes/categoryRoutes';
import CategoryModel from '../models/catergoryModel';

const app = express();
app.use(express.json());
app.use('/api/categories', categoryRoutes);

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Category Routes', () => {
  let categoryId: string;

  /** POST - Create Category */
  it('should create a new category', async () => {
    const response = await request(app)
      .post('/api/categories')
      .send({ name: 'Test Category' })
      .expect(201);

    expect(response.body.category.name).toBe('Test Category');
    categoryId = response.body.category._id;
  });

  it('should fail to create a category with missing name', async () => {
    const response = await request(app)
      .post('/api/categories')
      .send({})
      .expect(500);

    expect(response.body.message).toBe(
      'Category validation failed: name: Path `name` is required.',
    );
  });

  /** PUT - Update Category */
  it('should update an existing category', async () => {
    const response = await request(app)
      .put(`/api/categories/${categoryId}`)
      .send({ name: 'Updated Category' })
      .expect(200);

    expect(response.body.category.name).toBe('Updated Category');
  });

  it('should fail to update a non-existing category', async () => {
    const response = await request(app)
      .put('/api/categories/60d5f9f9f9f9f9f9f9f9f9f9')
      .send({ name: 'Non-existing Category' })
      .expect(500);

    expect(response.body.message).toBe('Category not found');
  });

  /** DELETE - Delete Category */
  it('should delete an existing category', async () => {
    await request(app).delete(`/api/categories/${categoryId}`).expect(200);

    const deletedCategory = await CategoryModel.findById(categoryId);
    expect(deletedCategory).toBeNull();
  });

  it('should fail to delete a non-existing category', async () => {
    const response = await request(app)
      .delete('/api/categories/60d5f9f9f9f9f9f9f9f9f9f9')
      .expect(500);

    expect(response.body.message).toBe('Category not found');
  });

  /** GET - Get Category Tree */
  it('should get the category tree', async () => {
    const response = await request(app).get('/api/categories/tree').expect(200);
    expect(response.body).toHaveProperty('tree');
    expect(Array.isArray(response.body.tree)).toBe(true);
  });
});
